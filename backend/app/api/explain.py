from fastapi import APIRouter
from app.schemas.request import ExplainRequest

router = APIRouter()


# =====================================================
# Line Explanation Engine
# =====================================================

def explain_line(line: str) -> str:
    line = line.strip()

    handlers = [
        handle_function_definition,
        handle_class_definition,
        handle_return,
        handle_for_loop,
        handle_while_loop,
        handle_conditionals,
        handle_print,
        handle_builtins,
        handle_augmented_assignment,
        handle_assignment,
        handle_function_call
    ]

    for handler in handlers:
        explanation = handler(line)
        if explanation:
            return explanation

    return "Executes this line of code."


# =====================================================
# Individual Handlers
# =====================================================

def handle_function_definition(line):
    if line.startswith("def "):
        name = line.split("def", 1)[1].split("(", 1)[0].strip()
        return f"Defines a function named '{name}'."
    return None


def handle_class_definition(line):
    if line.startswith("class "):
        name = line.split("class", 1)[1].split(":", 1)[0].strip()
        return f"Defines a class named '{name}'."
    return None


def handle_return(line):
    if line == "return":
        return "Returns control back to where the function was called."

    if line.startswith("return "):
        value = line.replace("return", "", 1).strip()
        return f"Returns the value '{value}' to where the function was called."

    return None


def handle_for_loop(line):
    if not line.startswith("for "):
        return None

    if "range(" in line:
        args = line.split("range(", 1)[1].rsplit(")", 1)[0]
        parts = [p.strip() for p in args.split(",")]

        if len(parts) == 1:
            return f"Starts a loop from 0 up to (but not including) {parts[0]}."
        if len(parts) == 2:
            return f"Starts a loop from {parts[0]} up to (but not including) {parts[1]}."
        if len(parts) == 3:
            return f"Starts a loop from {parts[0]} to {parts[1]}, increasing by {parts[2]} each time."

    return "Starts a loop that iterates over a sequence."


def handle_while_loop(line):
    if line.startswith("while "):
        return "Starts a loop that runs while the condition remains true."
    return None


def handle_conditionals(line):
    if line.startswith("if "):
        return "Checks whether the condition is true."
    if line.startswith("elif "):
        return "Checks another condition if the previous one was false."
    if line.startswith("else"):
        return "Executes this block if previous conditions were false."
    return None


def handle_print(line):
    if line.startswith("print("):
        content = line.split("print(", 1)[1].rsplit(")", 1)[0]
        return f"Prints {content} to the screen."
    return None


def handle_builtins(line):
    builtins = {
        "int(": "Converts into an integer (whole number).",
        "float(": "Converts into a floating-point number.",
        "str(": "Converts into a string (text format).",
        "sum(": "Calculates the total sum of elements.",
        "len(": "Calculates the number of elements.",
        "input(": "Takes input from the user."
    }

    for key, message in builtins.items():
        if key in line:
            arg = line.split(key, 1)[1].rsplit(")", 1)[0]
            return f"{message} Target: '{arg}'."

    return None


def handle_augmented_assignment(line):
    operators = {
        "+=": "Increases",
        "-=": "Decreases",
        "*=": "Multiplies",
        "/=": "Divides"
    }

    for op, action in operators.items():
        if op in line:
            var, value = line.split(op, 1)
            return f"{action} '{var.strip()}' by {value.strip()}."

    return None


def handle_assignment(line):
    if "=" in line and "==" not in line:
        left, right = line.split("=", 1)
        return f"Assigns '{right.strip()}' to variable '{left.strip()}'."
    return None


def handle_function_call(line):
    if "(" in line and ")" in line:
        func_name = line.split("(", 1)[0].strip()
        args = line.split("(", 1)[1].rsplit(")", 1)[0].strip()

        if args:
            return f"Calls the function '{func_name}' with arguments {args}."
        return f"Calls the function '{func_name}'."

    return None


# =====================================================
# API Endpoint
# =====================================================

@router.post("/explain")
def explain_code(request: ExplainRequest):

    lines = request.code.split("\n")
    steps = []
    indent_stack = []
    step_number = 1

    for index, raw_line in enumerate(lines):

        if not raw_line.strip():
            continue

        indent_level = (len(raw_line) - len(raw_line.lstrip(" "))) // 4
        stripped = raw_line.strip()

        while len(indent_stack) > indent_level:
            indent_stack.pop()

        explanation = explain_line(stripped)

        if indent_stack:
            context = " → ".join(indent_stack)
            explanation = f"Inside {context}: {explanation}"

        # Track block context
        if stripped.startswith("for "):
            indent_stack.append("loop")

        elif stripped.startswith(("if ", "elif ")):
            indent_stack.append("conditional block")

        elif stripped.startswith("while "):
            indent_stack.append("while loop")

        elif stripped.startswith("def "):
            indent_stack.append("function")

        elif stripped.startswith("class "):
            indent_stack.append("class")

        steps.append({
            "step": step_number,
            "line": index + 1,
            "explanation": explanation
        })

        step_number += 1

    return {
        "status": "success",
        "steps": steps
    }