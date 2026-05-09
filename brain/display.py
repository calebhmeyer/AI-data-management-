from datetime import datetime
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from rich.columns import Columns
from rich import box

console = Console()


def _age(ts: str) -> str:
    try:
        dt = datetime.fromisoformat(ts)
        delta = datetime.now() - dt
        s = int(delta.total_seconds())
        if s < 60:
            return f"{s}s ago"
        if s < 3600:
            return f"{s // 60}m ago"
        if s < 86400:
            return f"{s // 3600}h ago"
        if s < 86400 * 7:
            return f"{s // 86400}d ago"
        return dt.strftime("%b %d")
    except Exception:
        return ts


def _tag_badges(tags: list[str]) -> Text:
    t = Text()
    for i, tag in enumerate(tags):
        if i:
            t.append(" ")
        t.append(f"#{tag}", style="bold cyan")
    return t


def print_note(note, tags: list[str] = (), links=(), related=()):
    header = Text()
    header.append(f"#{note['id']}", style="bold yellow")
    header.append(f"  {_age(note['created_at'])}", style="dim")
    if tags:
        header.append("  ")
        header.append(_tag_badges(tags))

    body = Text(note["content"])

    panel = Panel(body, title=header, title_align="left", border_style="bright_black", padding=(0, 1))
    console.print(panel)

    if links:
        console.print("  [bold]Explicit links:[/bold]", style="dim")
        for ln in links:
            console.print(f"    [yellow]→ #{ln['id']}[/yellow]  {ln['content'][:80]}…", style="dim")

    if related:
        console.print("  [bold]Related notes:[/bold]", style="dim")
        for r in related:
            bar = "█" * int(r.score * 10)
            console.print(
                f"    [yellow]~ #{r.note_id}[/yellow] [green]{bar}[/green] [dim]{r.preview[:70]}…[/dim]"
            )


def print_note_list(notes, tags_map: dict[int, list[str]] = {}):
    if not notes:
        console.print("[dim]No notes found.[/dim]")
        return

    table = Table(box=box.SIMPLE, show_header=True, header_style="bold dim", expand=True)
    table.add_column("ID", style="yellow", width=5, no_wrap=True)
    table.add_column("Content", ratio=4)
    table.add_column("Tags", ratio=1)
    table.add_column("When", width=10, style="dim", no_wrap=True)

    for note in notes:
        preview = note["content"].replace("\n", " ")
        if len(preview) > 100:
            preview = preview[:97] + "…"
        tags = tags_map.get(note["id"], [])
        tag_str = " ".join(f"#{t}" for t in tags)
        table.add_row(str(note["id"]), preview, tag_str, _age(note["created_at"]))

    console.print(table)


def print_search_results(rows):
    if not rows:
        console.print("[dim]No results.[/dim]")
        return

    for row in rows:
        header = Text()
        header.append(f"#{row['id']}", style="bold yellow")
        header.append(f"  {_age(row['created_at'])}", style="dim")

        snippet = row["snippet"] if "snippet" in row.keys() else row["content"][:120]
        # highlight fts markers
        text = Text()
        for part in snippet.split("["):
            if "]" in part:
                highlighted, rest = part.split("]", 1)
                text.append(highlighted, style="bold white on dark_green")
                text.append(rest)
            else:
                text.append(part)

        console.print(Panel(text, title=header, title_align="left", border_style="bright_black", padding=(0, 1)))


def print_day_view(notes, day_str: str, tags_map: dict[int, list[str]] = {}):
    console.rule(f"[bold]{day_str}[/bold]")
    if not notes:
        console.print("[dim]  Nothing captured today.[/dim]")
        return
    for note in notes:
        ts = datetime.fromisoformat(note["created_at"]).strftime("%H:%M")
        tags = tags_map.get(note["id"], [])
        tag_part = ("  " + " ".join(f"[cyan]#{t}[/cyan]" for t in tags)) if tags else ""
        preview = note["content"].replace("\n", " ")
        console.print(f"  [dim]{ts}[/dim]  [white]{preview}[/white]{tag_part}")


def print_success(msg: str):
    console.print(f"[bold green]✓[/bold green] {msg}")


def print_error(msg: str):
    console.print(f"[bold red]✗[/bold red] {msg}")


def print_tags(rows):
    if not rows:
        console.print("[dim]No tags yet.[/dim]")
        return
    items = [f"[cyan]#{r['name']}[/cyan] [dim]({r['count']})[/dim]" for r in rows]
    console.print(Columns(items, equal=False, expand=False))
