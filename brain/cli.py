import sys
from datetime import date, datetime

import click

from . import db, display
from .search import find_related, extract_keywords


@click.group(invoke_without_command=True)
@click.argument("content", nargs=-1)
@click.option("--tags", "-t", default="", help="Comma-separated tags")
@click.pass_context
def main(ctx, content, tags):
    """
    Second Brain — capture and connect thoughts.

    \b
    Quick capture:  think "had an insight about attention mechanisms"
    Search:         think search "attention"
    Today:          think today
    Show note:      think show 42
    Related:        think related 42
    """
    if ctx.invoked_subcommand is not None:
        return
    if not content:
        click.echo(ctx.get_help())
        return
    text = " ".join(content)
    tag_list = [t for t in tags.split(",") if t.strip()] if tags else []
    note_id = db.add_note(text, tag_list)

    all_notes = db.all_notes_for_similarity()
    related = find_related(text, all_notes, top_n=3, exclude_id=note_id)

    display.print_success(f"Captured as note #{note_id}")
    if related:
        display.console.print("  [dim]Connects to:[/dim]")
        for r in related:
            display.console.print(
                f"    [yellow]~ #{r.note_id}[/yellow]  [dim]{r.preview[:80]}[/dim]"
            )


@main.command()
@click.argument("query")
@click.option("--limit", "-n", default=10, help="Max results")
def search(query, limit):
    """Full-text search across all notes."""
    rows = db.search_notes(query, limit=limit)
    display.print_search_results(rows)


@main.command()
@click.option("--limit", "-n", default=20, help="Max notes to show")
@click.option("--tag", "-t", default=None, help="Filter by tag")
def list(limit, tag):
    """List recent notes."""
    notes = db.list_notes(limit=limit, tag=tag)
    tags_map = {n["id"]: db.get_tags(n["id"]) for n in notes}
    display.print_note_list(notes, tags_map)


@main.command()
@click.argument("note_id", type=int)
def show(note_id):
    """Show a note with its tags, links, and related notes."""
    note = db.get_note(note_id)
    if not note:
        display.print_error(f"Note #{note_id} not found.")
        sys.exit(1)
    tags = db.get_tags(note_id)
    links = db.get_links(note_id)
    all_notes = db.all_notes_for_similarity()
    related = find_related(note["content"], all_notes, top_n=5, exclude_id=note_id)
    display.print_note(note, tags=tags, links=links, related=related)


@main.command()
@click.argument("note_id", type=int)
@click.option("--top", "-n", default=5, help="How many related notes to show")
@click.option("--min-score", default=0.03, help="Minimum similarity score")
def related(note_id, top, min_score):
    """Find notes related to a given note via TF-IDF similarity."""
    note = db.get_note(note_id)
    if not note:
        display.print_error(f"Note #{note_id} not found.")
        sys.exit(1)

    all_notes = db.all_notes_for_similarity()
    results = find_related(note["content"], all_notes, top_n=top, min_score=min_score, exclude_id=note_id)

    display.console.rule(f"[yellow]Related to #{note_id}[/yellow]")
    display.console.print(f"  [dim]{note['content'][:100]}[/dim]\n")

    kw = extract_keywords(note["content"])
    if kw:
        display.console.print(f"  [dim]Key concepts:[/dim] {', '.join(kw)}\n")

    if not results:
        display.console.print("[dim]  No related notes found.[/dim]")
        return

    for r in results:
        pct = int(r.score * 100)
        bar = "█" * max(1, int(r.score * 20))
        display.console.print(
            f"  [yellow]#{r.note_id}[/yellow]  [green]{bar}[/green] [dim]{pct}%[/dim]"
        )
        display.console.print(f"     [white]{r.preview[:100]}[/white]")
        display.console.print()


@main.command()
@click.option("--date", "-d", "day", default=None, help="Date as YYYY-MM-DD (default: today)")
def today(day):
    """Show notes captured today (or on a specific date)."""
    if day:
        try:
            d = date.fromisoformat(day)
        except ValueError:
            display.print_error(f"Invalid date: {day}. Use YYYY-MM-DD.")
            sys.exit(1)
    else:
        d = date.today()

    notes = db.notes_for_date(d)
    tags_map = {n["id"]: db.get_tags(n["id"]) for n in notes}
    display.print_day_view(notes, d.strftime("%A, %B %-d %Y"), tags_map)


@main.command()
@click.argument("source_id", type=int)
@click.argument("target_id", type=int)
def link(source_id, target_id):
    """Explicitly link two notes together."""
    for nid in (source_id, target_id):
        if not db.get_note(nid):
            display.print_error(f"Note #{nid} not found.")
            sys.exit(1)
    db.add_link(source_id, target_id)
    display.print_success(f"Linked #{source_id} ↔ #{target_id}")


@main.command()
@click.argument("note_id", type=int)
@click.confirmation_option(prompt="Delete this note?")
def delete(note_id):
    """Delete a note."""
    if db.delete_note(note_id):
        display.print_success(f"Deleted note #{note_id}")
    else:
        display.print_error(f"Note #{note_id} not found.")
        sys.exit(1)


@main.command()
def tags():
    """List all tags with usage counts."""
    rows = db.list_all_tags()
    display.print_tags(rows)


@main.command()
def stats():
    """Show database stats."""
    db.init_db()
    import sqlite3
    from . import db as _db
    conn = sqlite3.connect(_db.DB_PATH)
    conn.row_factory = sqlite3.Row
    note_count = conn.execute("SELECT COUNT(*) FROM notes").fetchone()[0]
    tag_count = conn.execute("SELECT COUNT(*) FROM tags").fetchone()[0]
    link_count = conn.execute("SELECT COUNT(*) FROM note_links").fetchone()[0]
    first = conn.execute("SELECT MIN(created_at) FROM notes").fetchone()[0]
    conn.close()

    display.console.print(f"  [yellow]{note_count}[/yellow] notes")
    display.console.print(f"  [cyan]{tag_count}[/cyan] tags")
    display.console.print(f"  [green]{link_count}[/green] explicit links")
    if first:
        display.console.print(f"  First note: [dim]{first}[/dim]")
    display.console.print(f"  Database: [dim]{_db.DB_PATH}[/dim]")
