#!/usr/bin/env python3
"""Sinh file *Test.java cho moi lop public tai com.motelmanagement (bo qua neu da ton tai)."""
from __future__ import annotations

import os
import re
import sys


def main() -> int:
    backend = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    main_root = os.path.join(backend, "src", "main", "java", "com", "motelmanagement")
    test_mot = os.path.join(backend, "src", "test", "java", "com", "motelmanagement")

    if not os.path.isdir(main_root):
        print("Khong tim thay:", main_root, file=sys.stderr)
        return 1

    seen: set[str] = set()
    created = 0
    skipped = 0

    for walk_root, _dirs, files in os.walk(main_root):
        for fn in files:
            if not fn.endswith(".java") or fn == "package-info.java":
                continue
            path = os.path.join(walk_root, fn)
            key = os.path.normcase(os.path.normpath(path))
            if key in seen:
                continue
            seen.add(key)

            with open(path, encoding="utf-8") as f:
                text = f.read()

            m_pkg = re.search(r"^package\s+([\w.]+);", text, re.M)
            m_typ = re.search(r"^public\s+(enum|interface|class|record)\s+(\w+)", text, re.M)
            if not m_pkg or not m_typ:
                continue

            pkg = m_pkg.group(1)
            kind, name = m_typ.group(1), m_typ.group(2)
            relpath = os.path.relpath(walk_root, main_root)
            out_dir = os.path.join(test_mot, relpath)
            out_path = os.path.join(out_dir, f"{name}Test.java")

            if os.path.isfile(out_path):
                skipped += 1
                continue

            os.makedirs(out_dir, exist_ok=True)
            body = build_test(pkg, kind, name, text, path)
            with open(out_path, "w", encoding="utf-8", newline="\n") as out:
                out.write(body)
            created += 1

    print(f"Tao moi: {created}, bo qua (da co): {skipped}")
    return 0


def build_test(pkg: str, kind: str, name: str, text: str, source_path: str) -> str:
    fqn = f"{pkg}.{name}"
    lines: list[str] = [
        f"package {pkg};",
        "",
        "import static org.junit.jupiter.api.Assertions.*;",
        "",
        "import org.junit.jupiter.api.Test;",
    ]

    needs_jpa = kind == "interface" and "Repository" in name
    needs_reflect = kind in ("class",) and should_try_default_ctor(kind, text, source_path)

    if needs_jpa:
        lines.append("import org.springframework.data.jpa.repository.JpaRepository;")
    if needs_reflect:
        lines.append("import java.lang.reflect.Constructor;")

    lines.append("")

    lines.append(f"class {name}Test {{")
    lines.append("")

    if kind == "enum":
        lines.extend(
            [
                "    @Test",
                f"    void enumCoGiaTri() {{",
                f"        assertTrue({name}.values().length > 0);",
                "    }",
                "",
                "    @Test",
                f"    void tenDayDu() {{",
                f'        assertEquals("{fqn}", {name}.class.getName());',
                "    }",
            ]
        )
    elif kind == "interface":
        lines.extend(
            [
                "    @Test",
                f"    void lopLaInterface() {{",
                f"        assertTrue({name}.class.isInterface());",
                "    }",
            ]
        )
        if needs_jpa:
            lines.extend(
                [
                    "",
                    "    @Test",
                    "    void moRongJpaRepository() {",
                    f"        assertTrue(JpaRepository.class.isAssignableFrom({name}.class));",
                    "    }",
                ]
            )
        lines.extend(
            [
                "",
                "    @Test",
                f"    void tenDayDu() {{",
                f'        assertEquals("{fqn}", {name}.class.getName());',
                "    }",
            ]
        )
    else:
        lines.extend(
            [
                "    @Test",
                f"    void tenDayDu() {{",
                f'        assertEquals("{fqn}", {name}.class.getName());',
                "    }",
            ]
        )
        if needs_reflect:
            lines.extend(
                [
                    "",
                    "    @Test",
                    f"    void coTheTaoBangConstructorKhongThamSo() throws Exception {{",
                    f"        Constructor<?> c = {name}.class.getDeclaredConstructor();",
                    "        c.setAccessible(true);",
                    f"        assertNotNull(c.newInstance());",
                    "    }",
                ]
            )

    lines.append("}")
    lines.append("")
    return "\n".join(lines)


def should_try_default_ctor(kind: str, text: str, path: str) -> bool:
    if kind == "record":
        return False
    if re.search(r"\babstract\s+class\b", text):
        return False
    if "@RequiredArgsConstructor" in text:
        return False
    if "@AllArgsConstructor" in text and "@NoArgsConstructor" not in text:
        return False
    if "@NoArgsConstructor" in text:
        return True
    p = path.replace("\\", "/")
    if "/domain/" in p and "@Entity" in text:
        return True
    if "/dto/" in p:
        return True
    return False


if __name__ == "__main__":
    raise SystemExit(main())
