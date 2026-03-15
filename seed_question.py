"""
seed_turso_200.py
─────────────────────────────────────────────────────────────────────────────
Inserts 200 NEW MCQ questions (different from the original 150) into Turso.

Topics covered:
  🐍 python-basics       🔄 python-loops     ⚙️ python-functions
  🏗️ python-oop          📐 algebra-basics   ∫  calculus
  ⚡ physics-mechanics   🧪 chemistry        🤖 machine-learning
  🧠 neural-networks

Difficulty: 1=Easy  2=Medium  3=Hard  (all three per topic)

Usage
─────
  export TURSO_URL="libsql://<your-db>.turso.io"
  export TURSO_TOKEN="<your-auth-token>"
  python seed_turso_200.py
─────────────────────────────────────────────────────────────────────────────
"""

import os, json, uuid, urllib.request

TURSO_URL   = os.environ.get("TURSO_URL",   "libsql://edugame-nickocracker.aws-ap-south-1.turso.io")
TURSO_TOKEN = os.environ.get("TURSO_TOKEN", "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzM1NjE2MjcsImlkIjoiMDE5Y2VjYmUtZDMwMS03ZmQwLTg4NjQtOWZjMDQyODlkNzJiIiwicmlkIjoiNzBlZjRlNmItNzg3NC00ZTQ0LTk0NjgtNGQyYTY3MDkxMGI3In0.aWF6TPWmIIz_x9NSqZRBsf5BlWD0kns1zmPlB4H9eV8hbMhCrQPKztHf2AJvjC45BBI_qh3zijqNOWBV2fhEAQ")

# ── HTTP helper ───────────────────────────────────────────────────────────────
def _pipeline(requests: list[dict]) -> dict:
    base = TURSO_URL.replace("libsql://", "https://")
    req  = urllib.request.Request(
        f"{base}/v2/pipeline",
        data=json.dumps({"requests": requests}).encode(),
        headers={"Authorization": f"Bearer {TURSO_TOKEN}",
                 "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

def execute_sql(sql: str, args: list = None):
    stmt = {"sql": sql}
    if args:
        stmt["args"] = [{"type": "text", "value": str(a)} for a in args]
    return _pipeline([{"type": "execute", "stmt": stmt}, {"type": "close"}])

def execute_batch(stmts: list[tuple]):
    reqs = [{"type": "execute",
             "stmt": {"sql": s, "args": [{"type":"text","value":str(a)} for a in args]}}
            for s, args in stmts]
    reqs.append({"type": "close"})
    return _pipeline(reqs)

# ── DDL ───────────────────────────────────────────────────────────────────────
CREATE_SQL = """CREATE TABLE IF NOT EXISTS questions (
    id            TEXT PRIMARY KEY,
    topic         TEXT NOT NULL,
    subject       TEXT NOT NULL,
    body          TEXT NOT NULL,
    type          TEXT DEFAULT 'mcq',
    explanation   TEXT,
    difficulty    INTEGER DEFAULT 1,
    options_json  TEXT NOT NULL,
    correct_index INTEGER NOT NULL
)"""

INSERT_SQL = """INSERT OR IGNORE INTO questions
    (id,topic,subject,body,type,explanation,difficulty,options_json,correct_index)
    VALUES (?,?,?,?,'mcq',?,?,?,?)"""

# ── 200 NEW Questions ─────────────────────────────────────────────────────────
# Format: (topic, subject, body, explanation, difficulty, [options], correct_index)
QUESTIONS = [

    # ══════════════════════════════════════════════════════════════════════════
    # 🐍  PYTHON BASICS  (20 new)
    # ══════════════════════════════════════════════════════════════════════════
    ("python-basics","🐍 Python Basics",
     "What is the output of `print(0.1 + 0.2 == 0.3)`?",
     "Floating-point arithmetic is imprecise; 0.1+0.2 ≠ 0.3 exactly in IEEE 754.",
     1,["True","False","Error","None"],1),

    ("python-basics","🐍 Python Basics",
     "Which data type is IMMUTABLE in Python?",
     "Tuples are immutable; once created their elements cannot be changed.",
     1,["list","dict","set","tuple"],3),

    ("python-basics","🐍 Python Basics",
     "What does the `in` operator do with a list?",
     "`in` checks membership and returns True if the element exists in the list.",
     1,["Adds element","Removes element","Checks membership","Sorts list"],2),

    ("python-basics","🐍 Python Basics",
     "What is the output of `bool('')`?",
     "Empty strings are falsy in Python, so bool('') returns False.",
     1,["True","False","None","Error"],1),

    ("python-basics","🐍 Python Basics",
     "What method converts a string to uppercase?",
     "str.upper() returns a copy of the string in uppercase.",
     1,["str.caps()","str.upper()","str.toUpper()","str.capitalize()"],1),

    ("python-basics","🐍 Python Basics",
     "What is the output of `type([])`?",
     "[] creates an empty list, whose type is <class 'list'>.",
     1,["<class 'tuple'>","<class 'dict'>","<class 'list'>","<class 'set'>"],2),

    ("python-basics","🐍 Python Basics",
     "What does `str.split(',')` do?",
     "split() breaks a string at each delimiter and returns a list of substrings.",
     2,["Joins strings","Splits string at delimiter into list","Removes commas","Counts commas"],1),

    ("python-basics","🐍 Python Basics",
     "What is the output of `[1,2,3] + [4,5]`?",
     "List concatenation with + returns a new combined list.",
     2,["[1,2,3,4,5]","[5,7]","Error","[[1,2,3],[4,5]]"],0),

    ("python-basics","🐍 Python Basics",
     "What does `sorted([3,1,2])` return?",
     "sorted() returns a new sorted list without modifying the original.",
     2,["[1,2,3]","[3,2,1]","None","Error"],0),

    ("python-basics","🐍 Python Basics",
     "How do you check if a key exists in a dictionary?",
     "The `in` operator checks for key membership in a dictionary.",
     2,["dict.has(key)","key in dict","dict.contains(key)","dict.exists(key)"],1),

    ("python-basics","🐍 Python Basics",
     "What does `''.join(['a','b','c'])` return?",
     "join() concatenates list elements using the string as separator (empty here).",
     2,["'a b c'","'a,b,c'","'abc'","['a','b','c']"],2),

    ("python-basics","🐍 Python Basics",
     "What is a frozenset?",
     "A frozenset is an immutable version of a set — hashable and cannot be modified.",
     2,["A sorted set","An immutable hashable set","A named set","A set with duplicates"],1),

    ("python-basics","🐍 Python Basics",
     "What is the output of `divmod(17, 5)`?",
     "divmod(a,b) returns (quotient, remainder): 17//5=3, 17%5=2.",
     3,["(3,2)","(2,3)","(3.4, 0)","(17,5)"],0),

    ("python-basics","🐍 Python Basics",
     "What does `__name__ == '__main__'` guard do?",
     "It ensures the code block runs only when the file is executed directly, not when imported.",
     3,["Defines the module name","Prevents code running on import","Checks Python version","Creates a main class"],1),

    ("python-basics","🐍 Python Basics",
     "What is the difference between `deepcopy` and `copy`?",
     "copy() makes a shallow copy (nested objects still shared); deepcopy() recursively copies all objects.",
     3,["No difference","deepcopy copies nested objects recursively; copy does not","copy is faster and copies everything","deepcopy is only for dicts"],1),

    ("python-basics","🐍 Python Basics",
     "What does the walrus operator `:=` do?",
     "The walrus operator assigns a value to a variable as part of an expression (Python 3.8+).",
     3,["Checks equality","Assigns a value inside an expression","Compares objects","Unpacks a tuple"],1),

    ("python-basics","🐍 Python Basics",
     "What is a Python namespace?",
     "A namespace is a mapping from names to objects, preventing naming conflicts.",
     3,["A memory address","A mapping from names to objects","A module path","A type hint"],1),

    ("python-basics","🐍 Python Basics",
     "What does `zip_longest` from itertools do vs `zip`?",
     "zip() stops at the shortest iterable; zip_longest fills missing values with a fillvalue.",
     3,["They are identical","zip_longest fills missing values; zip stops at shortest","zip_longest is faster","zip_longest reverses order"],1),

    ("python-basics","🐍 Python Basics",
     "What is the output of `[x for x in range(10) if x % 2 == 0]`?",
     "Filters even numbers from 0–9.",
     2,["[0,2,4,6,8]","[1,3,5,7,9]","[0,1,2,3,4]","[2,4,6,8,10]"],0),

    ("python-basics","🐍 Python Basics",
     "What does `enumerate` start from by default?",
     "enumerate(iterable) starts indexing at 0 by default; use start= to change it.",
     1,["1","0","-1","None"],1),

    # ══════════════════════════════════════════════════════════════════════════
    # 🔄  PYTHON LOOPS  (20 new)
    # ══════════════════════════════════════════════════════════════════════════
    ("python-loops","🔄 Python Loops",
     "What is the output of `for i in range(0): print(i)`?",
     "range(0) is empty so the loop body never executes — nothing prints.",
     1,["0","Nothing prints","Error","1"],1),

    ("python-loops","🔄 Python Loops",
     "Which loop is guaranteed to execute at least once?",
     "Python has no do-while loop, but you can simulate it with while True and break.",
     1,["for loop","while loop","do-while loop","Python has no such loop"],3),

    ("python-loops","🔄 Python Loops",
     "What does `reversed([1,2,3])` return?",
     "reversed() returns a reverse iterator, not a new list.",
     1,["[3,2,1]","A reverse iterator","Error","[1,2,3]"],1),

    ("python-loops","🔄 Python Loops",
     "What is the result of iterating over a string with a for loop?",
     "Iterating over a string yields each character one at a time.",
     1,["Words","Characters one at a time","Bytes","ASCII codes"],1),

    ("python-loops","🔄 Python Loops",
     "What does `while True` do if there is no break?",
     "Without a break or return, `while True` runs as an infinite loop.",
     1,["Runs once","Errors immediately","Runs infinitely","Runs twice"],2),

    ("python-loops","🔄 Python Loops",
     "What is the output of:\nfor i in range(5):\n    if i == 3: break\nelse:\n    print('done')",
     "The break at i==3 prevents the else clause from executing.",
     2,["done","3","Nothing prints","Error"],2),

    ("python-loops","🔄 Python Loops",
     "How do you iterate over a list with both index and value?",
     "enumerate() gives (index, value) pairs, making it the idiomatic choice.",
     2,["range(len(lst))","enumerate(lst)","zip(lst)","iter(lst)"],1),

    ("python-loops","🔄 Python Loops",
     "What is the output of `list(map(lambda x: x*2, [1,2,3]))`?",
     "map applies the lambda to each element, doubling all values.",
     2,["[2,4,6]","[1,2,3]","[1,4,9]","Error"],0),

    ("python-loops","🔄 Python Loops",
     "What does `filter(None, [0,1,'',2,False,3])` return?",
     "filter(None, iterable) removes all falsy values.",
     2,["[0,'',False]","[1,2,3]","[0,1,'',2,False,3]","Error"],1),

    ("python-loops","🔄 Python Loops",
     "What is a nested list comprehension `[j for i in [[1,2],[3,4]] for j in i]`?",
     "The outer loop iterates over sublists, inner loop over elements, flattening to [1,2,3,4].",
     2,["[[1,2],[3,4]]","[1,2,3,4]","[1,3]","Error"],1),

    ("python-loops","🔄 Python Loops",
     "What does `itertools.cycle([1,2,3])` do?",
     "cycle() creates an infinite iterator that loops over the elements repeatedly.",
     2,["Sorts the list cyclically","Creates an infinite repeating iterator","Reverses the list","Shuffles elements"],1),

    ("python-loops","🔄 Python Loops",
     "What is the output of `sum([i**2 for i in range(4)])`?",
     "Squares: 0+1+4+9 = 14.",
     2,["14","30","16","Error"],0),

    ("python-loops","🔄 Python Loops",
     "How does `itertools.chain([1,2],[3,4])` work?",
     "chain() chains multiple iterables together as a single sequential iterator.",
     3,["Zips two iterables","Concatenates iterables sequentially","Multiplies elements","Flattens nested lists"],1),

    ("python-loops","🔄 Python Loops",
     "What is the time complexity of a for loop over a list of n elements?",
     "Iterating over all n elements is O(n) — linear time.",
     3,["O(1)","O(log n)","O(n)","O(n²)"],2),

    ("python-loops","🔄 Python Loops",
     "What does `itertools.islice(iter, 3)` do?",
     "islice returns the first 3 elements from an iterator without materialising the rest.",
     3,["Skips 3 elements","Returns first 3 elements lazily","Repeats 3 times","Reverses first 3"],1),

    ("python-loops","🔄 Python Loops",
     "What is the difference between `iter()` and `next()`?",
     "iter() converts an iterable to an iterator; next() retrieves the next item from it.",
     3,["They are the same","iter() creates an iterator; next() retrieves next item","next() creates an iterator","iter() retrieves next item"],1),

    ("python-loops","🔄 Python Loops",
     "What happens when `next()` is called on an exhausted iterator?",
     "StopIteration is raised when the iterator has no more items.",
     3,["Returns None","Returns -1","Raises StopIteration","Restarts the iterator"],2),

    ("python-loops","🔄 Python Loops",
     "What does `any([False, 0, '', 1])` return?",
     "any() returns True if at least one element is truthy — here 1 is truthy.",
     2,["False","True","None","Error"],1),

    ("python-loops","🔄 Python Loops",
     "What does `all([1, 2, 3, 0])` return?",
     "all() returns True only if every element is truthy; 0 is falsy so it returns False.",
     2,["True","False","None","Error"],1),

    ("python-loops","🔄 Python Loops",
     "What is the output of `{x: x**2 for x in range(4)}`?",
     "Dictionary comprehension creates {0:0, 1:1, 2:4, 3:9}.",
     3,["{0:0,1:1,2:4,3:9}","[0,1,4,9]","{0,1,4,9}","Error"],0),

    # ══════════════════════════════════════════════════════════════════════════
    # ⚙️  PYTHON FUNCTIONS  (20 new)
    # ══════════════════════════════════════════════════════════════════════════
    ("python-functions","⚙️ Python Functions",
     "What is the output of a function that has no return statement?",
     "A function without an explicit return statement returns None.",
     1,["0","''","None","Error"],2),

    ("python-functions","⚙️ Python Functions",
     "What does the `global` keyword do inside a function?",
     "`global` declares that a variable refers to the global scope, not a local one.",
     1,["Creates a new variable","Makes variable accessible globally inside function","Deletes a global variable","Locks a variable"],1),

    ("python-functions","⚙️ Python Functions",
     "What is the output of `max([3,1,4,1,5,9,2,6])`?",
     "max() returns the largest element in the iterable, which is 9.",
     1,["6","9","3","Error"],1),

    ("python-functions","⚙️ Python Functions",
     "What does `abs(-7)` return?",
     "abs() returns the absolute (non-negative) value of a number.",
     1,["7","-7","0","Error"],0),

    ("python-functions","⚙️ Python Functions",
     "What is the purpose of `help()` in Python?",
     "help() displays the documentation (docstring) for a module, function, or object.",
     1,["Exits Python","Shows documentation","Runs a script","Imports a module"],1),

    ("python-functions","⚙️ Python Functions",
     "What does `round(3.14159, 2)` return?",
     "round(number, ndigits) rounds to the given decimal places: 3.14.",
     2,["3.1","3.14","3.142","3"],1),

    ("python-functions","⚙️ Python Functions",
     "What is a higher-order function?",
     "A higher-order function takes functions as arguments or returns a function.",
     2,["A function defined at module level","A function that takes/returns other functions","A class method","A built-in function"],1),

    ("python-functions","⚙️ Python Functions",
     "What does the `nonlocal` keyword do?",
     "`nonlocal` binds a variable to the nearest enclosing scope that is not global.",
     2,["Declares a global variable","Binds variable to enclosing non-global scope","Deletes a variable","Makes a variable constant"],1),

    ("python-functions","⚙️ Python Functions",
     "What is the output of `(lambda *args: sum(args))(1,2,3,4)`?",
     "The lambda sums all positional args: 1+2+3+4=10.",
     2,["10","24","[1,2,3,4]","Error"],0),

    ("python-functions","⚙️ Python Functions",
     "What does `@staticmethod` allow?",
     "@staticmethod defines a method that doesn't receive self or cls — it's like a plain function inside a class.",
     2,["Access instance attributes","Access class attributes","Define a method without self or cls","Create a property"],2),

    ("python-functions","⚙️ Python Functions",
     "What is memoisation?",
     "Memoisation caches function return values for given inputs to avoid redundant computation.",
     2,["Deleting old variables","Caching results of expensive function calls","Logging function calls","Compiling functions"],1),

    ("python-functions","⚙️ Python Functions",
     "What does `zip(*matrix)` do when matrix is a 2D list?",
     "zip(*matrix) transposes the matrix by unpacking rows as arguments to zip.",
     3,["Reverses matrix","Flattens matrix","Transposes the matrix","Sorts the matrix"],2),

    ("python-functions","⚙️ Python Functions",
     "What is a decorator in Python?",
     "A decorator is a function that wraps another function to extend or modify its behaviour.",
     3,["A class attribute","A function that wraps another function to modify its behaviour","A type annotation","A built-in function"],1),

    ("python-functions","⚙️ Python Functions",
     "What does `functools.partial` do?",
     "partial() creates a new function with some arguments of the original pre-filled.",
     3,["Imports part of a module","Creates a new function with pre-filled arguments","Returns part of a list","Partially applies decorators"],1),

    ("python-functions","⚙️ Python Functions",
     "What is tail recursion and does CPython optimise it?",
     "Tail recursion is when the recursive call is the last action; CPython does NOT optimise it — deep recursion still hits the limit.",
     3,["CPython optimises tail calls","Tail recursion is the first call; CPython optimises it","Tail recursion is last-call recursion; CPython does NOT optimise it","CPython converts tail calls to loops automatically"],2),

    ("python-functions","⚙️ Python Functions",
     "What is the default recursion limit in CPython?",
     "CPython's default recursion limit is 1000, changeable via sys.setrecursionlimit().",
     3,["100","500","1000","unlimited"],2),

    ("python-functions","⚙️ Python Functions",
     "What does `inspect.signature(func)` return?",
     "It returns a Signature object describing the function's parameters and return annotation.",
     3,["Function source code","Signature object with parameters and annotations","Return value","Docstring"],1),

    ("python-functions","⚙️ Python Functions",
     "What is the purpose of `__doc__` attribute?",
     "__doc__ stores the docstring of a function, class, or module.",
     2,["Stores function name","Stores the docstring","Stores argument count","Stores return type"],1),

    ("python-functions","⚙️ Python Functions",
     "What does `callable(obj)` check?",
     "callable() returns True if the object appears callable (has a __call__ method).",
     2,["If obj is a function","If obj has a __call__ method","If obj is iterable","If obj is a class"],1),

    ("python-functions","⚙️ Python Functions",
     "What is the output of `list(filter(lambda x: x>2, [1,2,3,4]))`?",
     "filter keeps elements where lambda returns True: 3 and 4.",
     2,["[1,2]","[3,4]","[1,2,3,4]","Error"],1),

    # ══════════════════════════════════════════════════════════════════════════
    # 🏗️  PYTHON OOP  (20 new)
    # ══════════════════════════════════════════════════════════════════════════
    ("python-oop","🏗️ Python OOP",
     "What is the purpose of `__str__` vs `__repr__`?",
     "__str__ is for user-friendly display (str()); __repr__ is for unambiguous developer representation (repr()).",
     1,["They are identical","__str__ for users; __repr__ for developers/debugging","__repr__ for users; __str__ for debugging","Both call print()"],1),

    ("python-oop","🏗️ Python OOP",
     "What does `isinstance(obj, ClassName)` do?",
     "isinstance() returns True if obj is an instance of ClassName or its subclasses.",
     1,["Returns obj's type","Checks if obj is an instance of ClassName or subclass","Converts obj to ClassName","Compares two objects"],1),

    ("python-oop","🏗️ Python OOP",
     "How do you call a parent class method from a child class?",
     "super().method() calls the parent class's method from within the child class.",
     1,["parent.method()","super().method()","self.parent.method()","base.method()"],1),

    ("python-oop","🏗️ Python OOP",
     "What is the difference between a class variable and an instance variable?",
     "Class variables are shared across all instances; instance variables are unique to each object.",
     2,["No difference","Class variables are shared; instance variables are per-object","Instance variables are shared","Class variables can't be changed"],1),

    ("python-oop","🏗️ Python OOP",
     "What does `__del__` do in Python?",
     "__del__ is the destructor method, called when an object is about to be garbage collected.",
     2,["Deletes a class attribute","Called when object is garbage collected","Prevents deletion","Resets object state"],1),

    ("python-oop","🏗️ Python OOP",
     "What is composition in OOP?",
     "Composition is building complex objects by combining simpler objects, preferring it over inheritance.",
     2,["Inheriting from multiple classes","Building objects by combining other objects","Overriding methods","Making attributes private"],1),

    ("python-oop","🏗️ Python OOP",
     "What does `__eq__` define?",
     "__eq__ defines the == comparison behaviour between two objects.",
     2,["!= comparison","Less-than comparison","== comparison","Identity check"],2),

    ("python-oop","🏗️ Python OOP",
     "What is a mixin class?",
     "A mixin is a class that provides methods to other classes via multiple inheritance without being used standalone.",
     2,["A base class","A class providing reusable methods via multiple inheritance","An abstract class","A singleton class"],1),

    ("python-oop","🏗️ Python OOP",
     "What does `@dataclass` do in Python?",
     "@dataclass automatically generates __init__, __repr__, __eq__ and other boilerplate for data-holding classes.",
     2,["Creates a database model","Auto-generates __init__, __repr__, __eq__ for a class","Enforces type hints","Makes a class immutable"],1),

    ("python-oop","🏗️ Python OOP",
     "What is the Liskov Substitution Principle?",
     "LSP states that objects of a subclass should be substitutable for objects of the superclass without breaking the program.",
     3,["Subclasses should override all methods","Subclass objects must be substitutable for superclass objects","Classes should have one responsibility","Depend on abstractions not concretions"],1),

    ("python-oop","🏗️ Python OOP",
     "What is `__new__` and how does it differ from `__init__`?",
     "__new__ creates a new instance (allocates memory); __init__ initialises the already-created instance.",
     3,["They are identical","__new__ creates the instance; __init__ initialises it","__init__ creates; __new__ initialises","__new__ is for strings only"],1),

    ("python-oop","🏗️ Python OOP",
     "What is a Singleton design pattern?",
     "Singleton ensures only one instance of a class is ever created.",
     3,["A class with one method","A pattern ensuring only one instance exists","A class with private attributes","A mixin pattern"],1),

    ("python-oop","🏗️ Python OOP",
     "What does `__hash__` control?",
     "__hash__ defines the hash value of an object, enabling it to be used in sets and as dict keys.",
     3,["Object's memory size","Object's string representation","Object's hash value for sets/dicts","Object comparison"],2),

    ("python-oop","🏗️ Python OOP",
     "What is the difference between `__getattr__` and `__getattribute__`?",
     "__getattribute__ is called for every attribute access; __getattr__ is called only when normal lookup fails.",
     3,["No difference","__getattribute__ is called always; __getattr__ only on failure","__getattr__ is called always","__getattribute__ is only for methods"],1),

    ("python-oop","🏗️ Python OOP",
     "What is method resolution in Python for diamond inheritance?",
     "Python uses C3 linearization (MRO) to determine a consistent method resolution order avoiding duplication.",
     3,["Left-to-right depth-first","C3 linearization (MRO)","Right-to-left","Random order"],1),

    ("python-oop","🏗️ Python OOP",
     "What is the Open/Closed Principle in SOLID?",
     "Classes should be open for extension but closed for modification.",
     3,["Classes should be open and public","Open for extension, closed for modification","All methods should be public","One class per file"],1),

    ("python-oop","🏗️ Python OOP",
     "What does `__iter__` and `__next__` make a class?",
     "Implementing __iter__ and __next__ makes a class an iterator, usable in for loops.",
     3,["A generator","A context manager","An iterator","A decorator"],2),

    ("python-oop","🏗️ Python OOP",
     "What is `__enter__` and `__exit__` used for?",
     "They implement the context manager protocol, enabling `with` statement usage.",
     3,["Iteration protocol","Comparison protocol","Context manager protocol (with statement)","Hashing protocol"],2),

    ("python-oop","🏗️ Python OOP",
     "What is the difference between deep copy and shallow copy for objects?",
     "Shallow copy copies the object but shares nested references; deep copy duplicates everything recursively.",
     3,["No difference","Shallow shares nested refs; deep duplicates recursively","Deep is only for lists","Shallow is always slower"],1),

    ("python-oop","🏗️ Python OOP",
     "What does the `abc.ABC` base class provide?",
     "abc.ABC provides the infrastructure for defining abstract base classes with abstract methods.",
     3,["Multiple inheritance","Infrastructure for abstract base classes","Singleton pattern","Automatic properties"],1),

    # ══════════════════════════════════════════════════════════════════════════
    # 📐  ALGEBRA BASICS  (20 new)
    # ══════════════════════════════════════════════════════════════════════════
    ("algebra-basics","📐 Algebra Basics",
     "What is the value of 5! (5 factorial)?",
     "5! = 5×4×3×2×1 = 120.",
     1,["60","100","120","20"],2),

    ("algebra-basics","📐 Algebra Basics",
     "What is the additive identity?",
     "0 is the additive identity: a + 0 = a for any number a.",
     1,["1","0","-1","∞"],1),

    ("algebra-basics","📐 Algebra Basics",
     "What is the multiplicative inverse of 4?",
     "The multiplicative inverse (reciprocal) of 4 is 1/4, since 4 × 1/4 = 1.",
     1,["4","-4","1/4","1"],2),

    ("algebra-basics","📐 Algebra Basics",
     "Evaluate: 2³ × 2⁴",
     "Same base — add exponents: 2^(3+4) = 2⁷ = 128.",
     1,["128","64","256","32"],0),

    ("algebra-basics","📐 Algebra Basics",
     "What is the HCF (GCD) of 12 and 18?",
     "Factors of 12: 1,2,3,4,6,12; factors of 18: 1,2,3,6,9,18. HCF = 6.",
     1,["3","6","9","12"],1),

    ("algebra-basics","📐 Algebra Basics",
     "Simplify: (3x²y)(2xy³)",
     "Multiply coefficients and add exponents: 6x^(2+1)y^(1+3) = 6x³y⁴.",
     2,["6x³y⁴","5x³y⁴","6x²y³","6x³y³"],0),

    ("algebra-basics","📐 Algebra Basics",
     "What is the nth term of an arithmetic sequence with first term a and common difference d?",
     "aₙ = a + (n−1)d.",
     2,["a + nd","a × dⁿ","a + (n−1)d","a − (n−1)d"],2),

    ("algebra-basics","📐 Algebra Basics",
     "Solve: 3(x − 2) = 2(x + 5)",
     "3x−6=2x+10 → x=16.",
     2,["x=4","x=16","x=-4","x=8"],1),

    ("algebra-basics","📐 Algebra Basics",
     "What is the LCM of 4 and 6?",
     "Multiples of 4: 4,8,12; multiples of 6: 6,12. LCM = 12.",
     2,["6","12","18","24"],1),

    ("algebra-basics","📐 Algebra Basics",
     "What is the slope of a vertical line?",
     "A vertical line has an undefined slope (rise/0 = undefined).",
     2,["0","1","Undefined","∞"],2),

    ("algebra-basics","📐 Algebra Basics",
     "What is the equation of a circle with centre (h,k) and radius r?",
     "(x−h)² + (y−k)² = r².",
     2,["x²+y²=r²","(x−h)²+(y−k)²=r²","(x+h)²+(y+k)²=r","x²−y²=r²"],1),

    ("algebra-basics","📐 Algebra Basics",
     "Solve the inequality: 2x − 3 > 7",
     "2x > 10 → x > 5.",
     2,["x > 4","x > 5","x < 5","x > 2"],1),

    ("algebra-basics","📐 Algebra Basics",
     "What is the sum of a geometric series: a + ar + ar² + … + arⁿ⁻¹?",
     "S = a(1−rⁿ)/(1−r) for r ≠ 1.",
     3,["a(1+rⁿ)/(1+r)","a(1−rⁿ)/(1−r)","a×n×r","a/(1−r)"],1),

    ("algebra-basics","📐 Algebra Basics",
     "What is the Remainder Theorem?",
     "If f(x) is divided by (x−a), the remainder equals f(a).",
     3,["f(0) is the remainder","The remainder equals f(a) when dividing by (x−a)","Remainder is always 0","The quotient equals f(a)"],1),

    ("algebra-basics","📐 Algebra Basics",
     "What is a matrix determinant used for?",
     "The determinant tells whether a matrix is invertible (det≠0) and is used in solving linear systems.",
     3,["Finding the trace","Checking invertibility and solving linear systems","Transposing the matrix","Finding eigenvalues only"],1),

    ("algebra-basics","📐 Algebra Basics",
     "What is Cramer's Rule?",
     "Cramer's Rule expresses the solution of a linear system using ratios of determinants.",
     3,["A factoring technique","Solving linear systems using determinant ratios","A method for quadratic equations","Finding the GCD"],1),

    ("algebra-basics","📐 Algebra Basics",
     "What are complex numbers?",
     "Complex numbers have the form a+bi where a,b∈ℝ and i=√−1.",
     3,["Numbers with decimals","Numbers of the form a+bi where i=√-1","Irrational numbers","Negative integers"],1),

    ("algebra-basics","📐 Algebra Basics",
     "What is the modulus of the complex number 3+4i?",
     "|3+4i| = √(3²+4²) = √25 = 5.",
     3,["7","5","25","√7"],1),

    ("algebra-basics","📐 Algebra Basics",
     "What does it mean for a function to be one-to-one (injective)?",
     "A function is injective if distinct inputs always produce distinct outputs.",
     2,["Every output has an input","Distinct inputs give distinct outputs","Every input has exactly two outputs","The function is its own inverse"],1),

    ("algebra-basics","📐 Algebra Basics",
     "What is the domain of f(x) = √x?",
     "The square root is only defined for non-negative reals: x ≥ 0.",
     2,["All real numbers","x > 0","x ≥ 0","x ≤ 0"],2),

    # ══════════════════════════════════════════════════════════════════════════
    # ∫  CALCULUS  (20 new)
    # ══════════════════════════════════════════════════════════════════════════
    ("calculus","∫ Calculus",
     "What is the derivative of cos(x)?",
     "d/dx[cos(x)] = −sin(x).",
     1,["sin(x)","-sin(x)","tan(x)","-cos(x)"],1),

    ("calculus","∫ Calculus",
     "What is the integral of a constant k?",
     "∫k dx = kx + C.",
     1,["k","k+C","kx+C","kx"],2),

    ("calculus","∫ Calculus",
     "What is the Power Rule for integration?",
     "∫xⁿ dx = xⁿ⁺¹/(n+1) + C, for n ≠ −1.",
     1,["xⁿ + C","xⁿ/n + C","xⁿ⁺¹/(n+1) + C","n·xⁿ⁻¹"],2),

    ("calculus","∫ Calculus",
     "What is the Product Rule for derivatives?",
     "(fg)' = f'g + fg'.",
     2,["f'g'","f'g + fg'","fg' − f'g","f'/g'"],1),

    ("calculus","∫ Calculus",
     "What is the Quotient Rule?",
     "d/dx[f/g] = (f'g − fg') / g².",
     2,["(f'g + fg')/g²","f'/g'","(f'g − fg')/g²","f/g'"],2),

    ("calculus","∫ Calculus",
     "What does it mean for a function to be differentiable at a point?",
     "A function is differentiable at x=a if the derivative exists there (no corners or cusps).",
     2,["f(a) is defined","The limit of f(x) exists at a","The derivative exists at a","f is continuous everywhere"],2),

    ("calculus","∫ Calculus",
     "What is an improper integral?",
     "An improper integral has an infinite limit of integration or an integrand with a vertical asymptote.",
     2,["An integral that equals 0","An integral with infinite bounds or singular integrand","An integral with no solution","A definite integral"],1),

    ("calculus","∫ Calculus",
     "What is L'Hôpital's Rule used for?",
     "L'Hôpital's Rule evaluates limits of 0/0 or ∞/∞ indeterminate forms by differentiating numerator and denominator.",
     2,["Integration by parts","Evaluating 0/0 or ∞/∞ limits by differentiation","Finding critical points","Taylor expansion"],1),

    ("calculus","∫ Calculus",
     "What is the derivative of tan(x)?",
     "d/dx[tan(x)] = sec²(x).",
     2,["cos(x)","sec(x)","sec²(x)","-csc²(x)"],2),

    ("calculus","∫ Calculus",
     "What does the Mean Value Theorem state?",
     "MVT: if f is continuous on [a,b] and differentiable on (a,b), there exists c where f'(c) = (f(b)−f(a))/(b−a).",
     3,["f always has a maximum","There exists c where f'(c) equals the average rate of change","f'=0 somewhere","f is always increasing"],1),

    ("calculus","∫ Calculus",
     "What is integration by parts and its formula?",
     "∫u dv = uv − ∫v du, used to integrate products of functions.",
     3,["∫uv dx = u∫v dx","∫u dv = uv − ∫v du","∫uv = u'v'","∫u dv = u'v + uv'"],1),

    ("calculus","∫ Calculus",
     "What is a Taylor series?",
     "A Taylor series represents a function as an infinite sum of terms based on its derivatives at a single point.",
     3,["A finite polynomial","An infinite sum of derivative-based terms at a point","A Fourier expansion","A geometric series"],1),

    ("calculus","∫ Calculus",
     "What is the Maclaurin series of eˣ?",
     "eˣ = Σ(xⁿ/n!) = 1 + x + x²/2! + x³/3! + …",
     3,["1 + x + x² + x³","1 + x + x²/2! + x³/3! + …","x + x² + x³","eˣ = cos(x)+sin(x)"],1),

    ("calculus","∫ Calculus",
     "What is a partial derivative?",
     "A partial derivative differentiates a multivariable function with respect to one variable, holding others constant.",
     3,["Derivative of part of a function","Derivative w.r.t. one variable, holding others constant","A directional derivative","A second derivative"],1),

    ("calculus","∫ Calculus",
     "What is the gradient of a scalar field f(x,y)?",
     "∇f = (∂f/∂x, ∂f/∂y) — a vector pointing in the direction of steepest ascent.",
     3,["The divergence","A scalar value","Vector of partial derivatives pointing steepest ascent","The Laplacian"],2),

    ("calculus","∫ Calculus",
     "What condition must hold for a function to have a local minimum at x=c?",
     "f'(c)=0 (critical point) and f''(c)>0 (concave up) indicate a local minimum.",
     3,["f'(c) > 0","f'(c) = 0 and f''(c) < 0","f'(c) = 0 and f''(c) > 0","f(c) = 0"],2),

    ("calculus","∫ Calculus",
     "What is the Fundamental Theorem of Calculus Part 2?",
     "FTC Part 2: ∫ₐᵇ f(x)dx = F(b) − F(a) where F is any antiderivative of f.",
     3,["F'(x) = f(x)","∫ₐᵇ f(x)dx = F(b) − F(a)","∫f dx = f","The derivative of an integral equals the integrand at upper bound"],1),

    ("calculus","∫ Calculus",
     "What does it mean for a series to converge?",
     "A series converges if its partial sums approach a finite limit as the number of terms goes to infinity.",
     3,["Every term is positive","Partial sums approach a finite limit","The series has finite terms","Each term approaches 0"],1),

    ("calculus","∫ Calculus",
     "What is the Ratio Test for series convergence?",
     "If lim|aₙ₊₁/aₙ| < 1 the series converges; > 1 it diverges; = 1 it is inconclusive.",
     3,["Compares with a known series","Checks lim|aₙ₊₁/aₙ|; <1 converges, >1 diverges","Checks if terms go to 0","Uses integrals to test convergence"],1),

    ("calculus","∫ Calculus",
     "What is Euler's Identity?",
     "eⁱᵖ + 1 = 0, connecting e, i, π, 1, and 0.",
     3,["e = π","eⁱᵖ + 1 = 0","eⁱ = cos(1)+i·sin(1)","e·i·π = -1"],1),

    # ══════════════════════════════════════════════════════════════════════════
    # ⚡  PHYSICS MECHANICS  (20 new)
    # ══════════════════════════════════════════════════════════════════════════
    ("physics-mechanics","⚡ Physics Mechanics",
     "What is Newton's First Law of Motion?",
     "An object at rest stays at rest and an object in motion stays in motion unless acted on by a net external force.",
     1,["F=ma","Action-reaction","Objects maintain state unless external force acts","Energy is conserved"],2),

    ("physics-mechanics","⚡ Physics Mechanics",
     "What is Newton's Third Law?",
     "For every action there is an equal and opposite reaction.",
     1,["F=ma","Inertia law","Equal and opposite reaction","Conservation of energy"],2),

    ("physics-mechanics","⚡ Physics Mechanics",
     "What is the unit of pressure?",
     "Pressure is measured in Pascals (Pa) = N/m².",
     1,["Newton","Joule","Pascal","Watt"],2),

    ("physics-mechanics","⚡ Physics Mechanics",
     "What is the formula for average velocity?",
     "Average velocity = displacement / time.",
     1,["v = at","v = d/t","v = F/m","v = ½at²"],1),

    ("physics-mechanics","⚡ Physics Mechanics",
     "What is the difference between speed and velocity?",
     "Speed is a scalar (magnitude only); velocity is a vector (magnitude and direction).",
     1,["No difference","Speed is vector; velocity is scalar","Speed is scalar; velocity is vector (includes direction)","Velocity has no units"],2),

    ("physics-mechanics","⚡ Physics Mechanics",
     "What is the formula for momentum?",
     "p = mv — momentum equals mass times velocity.",
     2,["p = ma","p = mv","p = Ft","p = ½mv²"],1),

    ("physics-mechanics","⚡ Physics Mechanics",
     "What is the impulse-momentum theorem?",
     "Impulse J = FΔt = Δp — a force applied over time changes an object's momentum.",
     2,["F = ma","J = FΔt = Δp","E = mc²","W = Fd"],1),

    ("physics-mechanics","⚡ Physics Mechanics",
     "What does Archimedes' Principle state?",
     "A body submerged in fluid experiences an upward buoyant force equal to the weight of fluid displaced.",
     2,["Pressure increases with depth","Buoyant force equals weight of displaced fluid","Fluids flow from high to low pressure","Equal volumes displace equally"],1),

    ("physics-mechanics","⚡ Physics Mechanics",
     "What is the formula for the period of a simple pendulum?",
     "T = 2π√(L/g) where L is length and g is gravitational acceleration.",
     2,["T = 2πLC","T = 2π√(L/g)","T = √(g/L)","T = 2π/g"],1),

    ("physics-mechanics","⚡ Physics Mechanics",
     "What is the coefficient of friction?",
     "The coefficient of friction μ = friction force / normal force; it's dimensionless.",
     2,["μ = mg","μ = F/N (friction force / normal force)","μ = ma","μ = F×d"],1),

    ("physics-mechanics","⚡ Physics Mechanics",
     "What is the equation for projectile range (horizontal distance)?",
     "R = v₀²sin(2θ)/g for a projectile launched at angle θ with speed v₀.",
     3,["R = v₀t","R = v₀²sin(2θ)/g","R = v₀cosθ/g","R = v₀²/g"],1),

    ("physics-mechanics","⚡ Physics Mechanics",
     "What is angular momentum?",
     "L = Iω (moment of inertia × angular velocity) or L = r × p for a point mass.",
     3,["L = mv","L = Iω","L = Fτ","L = ½Iω²"],1),

    ("physics-mechanics","⚡ Physics Mechanics",
     "State the law of conservation of energy.",
     "Energy cannot be created or destroyed; the total energy of an isolated system is constant.",
     3,["Energy equals mass times c²","Total energy in isolated system is constant","Kinetic energy is always conserved","Only mechanical energy is conserved"],1),

    ("physics-mechanics","⚡ Physics Mechanics",
     "What is the formula for gravitational force between two masses?",
     "F = GMm/r² (Newton's Law of Universal Gravitation).",
     3,["F = mg","F = GMm/r²","F = kq₁q₂/r²","F = ma"],1),

    ("physics-mechanics","⚡ Physics Mechanics",
     "What is torque?",
     "Torque τ = r × F (cross product of position vector and force), the rotational equivalent of force.",
     3,["τ = mv","τ = Fd","τ = r × F","τ = Iα only"],2),

    ("physics-mechanics","⚡ Physics Mechanics",
     "What is elastic vs inelastic collision?",
     "Elastic: both momentum and KE conserved. Inelastic: only momentum conserved, KE lost.",
     3,["Both conserve energy","Elastic conserves KE; inelastic does not","Inelastic conserves KE; elastic does not","Neither conserves momentum"],1),

    ("physics-mechanics","⚡ Physics Mechanics",
     "What is simple harmonic motion (SHM)?",
     "SHM is periodic motion where restoring force is proportional and opposite to displacement: F = −kx.",
     3,["Constant speed circular motion","Periodic motion with F proportional to displacement","Motion with constant acceleration","Oscillation with decreasing amplitude"],1),

    ("physics-mechanics","⚡ Physics Mechanics",
     "What is the work done by a constant force?",
     "W = Fd·cosθ where θ is the angle between force and displacement.",
     2,["W = Fd","W = Fd·cosθ","W = ma·d","W = ½mv²"],1),

    ("physics-mechanics","⚡ Physics Mechanics",
     "What is mechanical advantage?",
     "Mechanical advantage = load / effort — the factor by which a machine multiplies force.",
     2,["Speed of machine","Load / effort — factor of force multiplication","Efficiency × 100","Distance ratio"],1),

    ("physics-mechanics","⚡ Physics Mechanics",
     "What is the formula for kinetic energy in rotational motion?",
     "Rotational KE = ½Iω² where I is moment of inertia and ω is angular velocity.",
     3,["½mv²","½Iω²","Iω","½mω²"],1),

    # ══════════════════════════════════════════════════════════════════════════
    # 🧪  CHEMISTRY  (20 new)
    # ══════════════════════════════════════════════════════════════════════════
    ("chemistry","🧪 Chemistry",
     "What is the chemical formula of water?",
     "Water is H₂O — two hydrogen atoms bonded to one oxygen atom.",
     1,["HO","H₂O","H₂O₂","HO₂"],1),

    ("chemistry","🧪 Chemistry",
     "What is the most abundant gas in Earth's atmosphere?",
     "Nitrogen (N₂) makes up ~78% of Earth's atmosphere.",
     1,["Oxygen","Carbon dioxide","Nitrogen","Argon"],2),

    ("chemistry","🧪 Chemistry",
     "What is an acid according to Brønsted-Lowry theory?",
     "A Brønsted-Lowry acid is a proton (H⁺) donor.",
     1,["Proton acceptor","Electron pair donor","Proton donor","OH⁻ producer"],2),

    ("chemistry","🧪 Chemistry",
     "What is the periodic table organised by?",
     "Elements are organised by increasing atomic number (number of protons).",
     1,["Atomic mass","Number of neutrons","Atomic number (protons)","Alphabetical order"],2),

    ("chemistry","🧪 Chemistry",
     "What is an ionic bond?",
     "An ionic bond forms when electrons are transferred from a metal to a non-metal, creating oppositely charged ions.",
     1,["Sharing of electrons","Electron transfer creating opposite ions","Metallic bonding","Hydrogen bonding"],1),

    ("chemistry","🧪 Chemistry",
     "What is the molar mass of CO₂?",
     "C=12, O=16×2=32; total molar mass = 44 g/mol.",
     2,["28 g/mol","44 g/mol","32 g/mol","40 g/mol"],1),

    ("chemistry","🧪 Chemistry",
     "What is a buffer solution?",
     "A buffer resists changes in pH when small amounts of acid or base are added.",
     2,["A solution with pH=7","A solution that resists pH changes","A neutral salt solution","A concentrated acid"],1),

    ("chemistry","🧪 Chemistry",
     "What is the difference between an atom and an ion?",
     "An atom is electrically neutral; an ion has gained or lost electrons, giving it a charge.",
     2,["No difference","Ion has a charge (gained/lost electrons); atom is neutral","Atom has a charge","Ion is larger than atom always"],1),

    ("chemistry","🧪 Chemistry",
     "What is a catalyst?",
     "A catalyst speeds up a reaction by lowering the activation energy without being consumed.",
     2,["A reactant consumed in reaction","A substance that lowers activation energy without being consumed","A product of reaction","An inhibitor"],1),

    ("chemistry","🧪 Chemistry",
     "What is the law of conservation of mass?",
     "In a chemical reaction, total mass of reactants equals total mass of products.",
     2,["Mass is destroyed in reactions","Total mass of reactants equals total mass of products","Mass increases in exothermic reactions","Only elements conserve mass"],1),

    ("chemistry","🧪 Chemistry",
     "What is entropy (S) in thermodynamics?",
     "Entropy measures the degree of disorder or randomness in a system; it tends to increase (2nd Law).",
     3,["Measure of energy","Measure of disorder/randomness","Measure of temperature","Measure of pressure"],1),

    ("chemistry","🧪 Chemistry",
     "What does Gibbs free energy (ΔG) determine?",
     "ΔG determines spontaneity: ΔG < 0 means the reaction is spontaneous.",
     3,["Reaction rate","Equilibrium position only","Spontaneity: ΔG<0 is spontaneous","Temperature of reaction"],2),

    ("chemistry","🧪 Chemistry",
     "What is the Henderson-Hasselbalch equation?",
     "pH = pKa + log([A⁻]/[HA]) — used to calculate pH of buffer solutions.",
     3,["pH = pKa × [A]/[HA]","pH = pKa + log([A⁻]/[HA])","pH = -log[H⁺] only","pH = pKb − log([B]/[BH⁺])"],1),

    ("chemistry","🧪 Chemistry",
     "What is the difference between SN1 and SN2 reactions?",
     "SN1 is two-step (carbocation intermediate), unimolecular; SN2 is one-step (backside attack), bimolecular.",
     3,["No difference","SN1 two-step with carbocation; SN2 one-step backside attack","SN2 forms carbocation","SN1 is bimolecular"],1),

    ("chemistry","🧪 Chemistry",
     "What is electronegativity?",
     "Electronegativity is the tendency of an atom to attract electrons in a covalent bond.",
     2,["Tendency to lose protons","Tendency to attract electrons in a bond","Nuclear charge","Atomic radius"],1),

    ("chemistry","🧪 Chemistry",
     "What are enantiomers?",
     "Enantiomers are non-superimposable mirror images of each other (chiral molecules).",
     3,["Structural isomers","Non-superimposable mirror images (chiral molecules)","Constitutional isomers","Geometric isomers"],1),

    ("chemistry","🧪 Chemistry",
     "What is the octet rule?",
     "Atoms tend to form bonds to achieve 8 electrons in their outer shell (like noble gases).",
     2,["Atoms have 8 protons","Atoms seek 8 electrons in outer shell","Only 8 elements bond","Period 2 only"],1),

    ("chemistry","🧪 Chemistry",
     "What is nuclear fission?",
     "Nuclear fission splits a heavy nucleus into smaller ones, releasing large amounts of energy.",
     3,["Combining two nuclei","Splitting a heavy nucleus into smaller ones with energy release","Emitting alpha particles","Neutron capture"],1),

    ("chemistry","🧪 Chemistry",
     "What is the difference between exothermic and endothermic reactions in terms of ΔH?",
     "Exothermic: ΔH < 0 (releases heat). Endothermic: ΔH > 0 (absorbs heat).",
     2,["Both have ΔH=0","Exothermic ΔH<0; endothermic ΔH>0","Exothermic ΔH>0; endothermic ΔH<0","ΔH is always positive"],1),

    ("chemistry","🧪 Chemistry",
     "What is a half-life in radioactive decay?",
     "Half-life is the time required for half of a radioactive sample to decay.",
     2,["Time for full decay","Time for half the sample to decay","Time for one atom to decay","Time for double the sample to decay"],1),

    # ══════════════════════════════════════════════════════════════════════════
    # 🤖  MACHINE LEARNING  (20 new)
    # ══════════════════════════════════════════════════════════════════════════
    ("machine-learning","🤖 Machine Learning",
     "What is unsupervised learning?",
     "Unsupervised learning finds hidden patterns in unlabeled data without predefined outputs.",
     1,["Training with labels","Finding patterns in unlabeled data","Reinforcement from rewards","Semi-supervised training"],1),

    ("machine-learning","🤖 Machine Learning",
     "What is a training set used for?",
     "The training set is used to fit (train) the model's parameters.",
     1,["Evaluating final performance","Fitting model parameters","Tuning hyperparameters","Deploying the model"],1),

    ("machine-learning","🤖 Machine Learning",
     "What is a test set used for?",
     "The test set evaluates the final model performance on unseen data.",
     1,["Training the model","Tuning hyperparameters","Evaluating final performance on unseen data","Feature selection"],2),

    ("machine-learning","🤖 Machine Learning",
     "What is linear regression used for?",
     "Linear regression predicts a continuous output variable from input features.",
     1,["Classifying categories","Predicting a continuous output","Clustering data","Dimensionality reduction"],1),

    ("machine-learning","🤖 Machine Learning",
     "What is the difference between classification and regression?",
     "Classification predicts discrete categories; regression predicts continuous values.",
     2,["No difference","Classification predicts categories; regression predicts continuous values","Regression predicts categories","Classification only uses neural networks"],1),

    ("machine-learning","🤖 Machine Learning",
     "What is a validation set?",
     "The validation set is used to tune hyperparameters and prevent overfitting during training.",
     2,["Replaces the test set","Used to tune hyperparameters during training","Used for initial training","Used for deployment"],1),

    ("machine-learning","🤖 Machine Learning",
     "What is a Random Forest?",
     "Random Forest is an ensemble of decision trees, each trained on a random subset of data and features.",
     2,["A single large decision tree","Ensemble of decision trees on random data/feature subsets","A neural network with random weights","A clustering algorithm"],1),

    ("machine-learning","🤖 Machine Learning",
     "What does 'normalisation' do to features?",
     "Normalisation scales features to a common range (e.g. [0,1]), preventing large-valued features from dominating.",
     2,["Removes features","Scales features to a common range","Adds new features","Converts features to categories"],1),

    ("machine-learning","🤖 Machine Learning",
     "What is the curse of dimensionality?",
     "As dimensions increase, data becomes sparse, distances lose meaning, and models require exponentially more data.",
     3,["Models get faster with more features","High dimensions cause sparsity and distance meaninglessness","More features always improve accuracy","Only applies to neural networks"],1),

    ("machine-learning","🤖 Machine Learning",
     "What is a support vector machine (SVM)?",
     "SVM finds the hyperplane that maximises the margin between classes in the feature space.",
     3,["A clustering algorithm","A model finding max-margin hyperplane between classes","A decision tree variant","A regression-only model"],1),

    ("machine-learning","🤖 Machine Learning",
     "What is boosting in machine learning?",
     "Boosting builds models sequentially where each corrects errors of the previous, e.g. AdaBoost, XGBoost.",
     3,["Training all models simultaneously","Building models sequentially each fixing prior errors","A data augmentation technique","A regularisation method"],1),

    ("machine-learning","🤖 Machine Learning",
     "What is the difference between bagging and boosting?",
     "Bagging trains models in parallel on random subsets (reduces variance); boosting is sequential (reduces bias).",
     3,["No difference","Bagging parallel/reduces variance; boosting sequential/reduces bias","Bagging is sequential; boosting is parallel","Both reduce variance only"],1),

    ("machine-learning","🤖 Machine Learning",
     "What is SMOTE used for?",
     "SMOTE (Synthetic Minority Over-sampling Technique) generates synthetic samples for the minority class to handle class imbalance.",
     3,["Feature selection","Handling class imbalance by generating synthetic minority samples","Normalising data","Dimensionality reduction"],1),

    ("machine-learning","🤖 Machine Learning",
     "What is the elbow method used for?",
     "The elbow method determines the optimal number of clusters k in K-Means by finding where inertia sharply drops.",
     3,["Selecting learning rate","Finding optimal k in K-Means clustering","Pruning decision trees","Selecting regularisation strength"],1),

    ("machine-learning","🤖 Machine Learning",
     "What is a precision-recall tradeoff?",
     "Increasing precision (fewer false positives) often reduces recall (more false negatives) and vice versa.",
     3,["Precision and recall always move together","Increasing precision often reduces recall and vice versa","Recall equals precision always","There is no tradeoff"],1),

    ("machine-learning","🤖 Machine Learning",
     "What does 'regularisation' prevent?",
     "Regularisation prevents overfitting by adding a penalty term to the loss function that discourages complex models.",
     2,["Underfitting","Overfitting by penalising model complexity","Slow convergence","Data leakage"],1),

    ("machine-learning","🤖 Machine Learning",
     "What is K-Means clustering?",
     "K-Means partitions data into k clusters by iteratively assigning points to the nearest centroid and updating centroids.",
     2,["A supervised classification algorithm","Partitions data into k clusters around centroids","A dimensionality reduction technique","A regression algorithm"],1),

    ("machine-learning","🤖 Machine Learning",
     "What is data leakage in machine learning?",
     "Data leakage occurs when information from outside the training set leaks into the model, causing overly optimistic results.",
     3,["Losing training data","Test data info leaking into training, causing inflated metrics","A privacy breach","Network data loss"],1),

    ("machine-learning","🤖 Machine Learning",
     "What is a hyperparameter search method called grid search?",
     "Grid search exhaustively tries all combinations of specified hyperparameter values to find the best configuration.",
     2,["Random hyperparameter selection","Exhaustively trying all specified hyperparameter combinations","Gradient-based hyperparameter tuning","Using defaults"],1),

    ("machine-learning","🤖 Machine Learning",
     "What is the F1 score?",
     "F1 score = 2 × (Precision × Recall) / (Precision + Recall) — the harmonic mean of precision and recall.",
     2,["Accuracy squared","Harmonic mean of precision and recall","Arithmetic mean of precision and recall","Same as AUC"],1),

    # ══════════════════════════════════════════════════════════════════════════
    # 🧠  NEURAL NETWORKS  (20 new)
    # ══════════════════════════════════════════════════════════════════════════
    ("neural-networks","🧠 Neural Networks",
     "What is a perceptron?",
     "A perceptron is the simplest neural network unit: a linear classifier with a step activation function.",
     1,["A deep network","The simplest neural unit: linear classifier with step activation","A convolutional layer","A recurrent unit"],1),

    ("neural-networks","🧠 Neural Networks",
     "What is the sigmoid activation function?",
     "Sigmoid σ(x) = 1/(1+e⁻ˣ), squashing output to (0,1), used in binary classification output layers.",
     1,["max(0,x)","1/(1+e⁻ˣ) squashing to (0,1)","tanh(x)","x if x>0 else 0"],1),

    ("neural-networks","🧠 Neural Networks",
     "What is the tanh activation function?",
     "tanh(x) = (eˣ−e⁻ˣ)/(eˣ+e⁻ˣ), squashing output to (−1,1).",
     1,["Squashes to (0,1)","Squashes to (-1,1)","Outputs x for x>0","Outputs 0 or 1 only"],1),

    ("neural-networks","🧠 Neural Networks",
     "What is a fully connected (dense) layer?",
     "Every neuron in a dense layer connects to every neuron in the previous layer.",
     1,["A layer with dropout","A layer where every neuron connects to every prior neuron","A convolutional layer","A pooling layer"],1),

    ("neural-networks","🧠 Neural Networks",
     "What does the number of neurons in the output layer depend on?",
     "It depends on the task: 1 for binary classification, C for C-class classification, 1+ for regression.",
     2,["Always 1","Always 10","Task type: 1 binary, C for C classes","Always equals input size"],2),

    ("neural-networks","🧠 Neural Networks",
     "What is max pooling?",
     "Max pooling downsamples feature maps by taking the maximum value in each pooling window.",
     2,["Averages values in window","Takes maximum value in pooling window to downsample","Adds padding","Flattens the feature map"],1),

    ("neural-networks","🧠 Neural Networks",
     "What is an autoencoder?",
     "An autoencoder encodes input to a latent representation then decodes it back, used for compression and anomaly detection.",
     2,["A classification model","Encodes to latent space then decodes; used for compression/anomaly detection","A generative model only","A recurrent network"],1),

    ("neural-networks","🧠 Neural Networks",
     "What is the difference between GRU and LSTM?",
     "LSTM has 3 gates (input, forget, output) and separate cell state; GRU has 2 gates and merges states, making it simpler.",
     3,["GRU is identical to LSTM","LSTM has 3 gates and cell state; GRU has 2 gates, simpler","GRU is more complex","Both have the same gate structure"],1),

    ("neural-networks","🧠 Neural Networks",
     "What is a Generative Adversarial Network (GAN)?",
     "A GAN has a generator creating fake data and a discriminator distinguishing real from fake, trained adversarially.",
     3,["A supervised classification model","Generator vs discriminator trained adversarially","A reinforcement learning model","An autoencoder variant"],1),

    ("neural-networks","🧠 Neural Networks",
     "What is the exploding gradient problem?",
     "Gradients grow exponentially during backpropagation in deep networks, causing unstable training and very large weight updates.",
     3,["Gradients become too small","Gradients grow exponentially causing unstable weight updates","Weights become zero","Loss function diverges at start"],1),

    ("neural-networks","🧠 Neural Networks",
     "What is gradient clipping used for?",
     "Gradient clipping caps gradient magnitude during backpropagation to prevent exploding gradients.",
     3,["Speeds up forward pass","Caps gradient magnitude to prevent exploding gradients","Prevents vanishing gradients","A regularisation technique like dropout"],1),

    ("neural-networks","🧠 Neural Networks",
     "What is the difference between online and batch gradient descent?",
     "Online (SGD) updates weights after each sample; batch GD updates after the entire dataset; mini-batch is in between.",
     3,["No difference","Online updates per sample; batch updates after full dataset","Batch is always better","Online uses full dataset"],1),

    ("neural-networks","🧠 Neural Networks",
     "What is the purpose of an embedding layer?",
     "An embedding layer maps discrete tokens (e.g. words) to dense continuous vectors in a learned latent space.",
     3,["Normalises inputs","Maps discrete tokens to dense continuous vectors","A convolution operation","A pooling layer"],1),

    ("neural-networks","🧠 Neural Networks",
     "What is a residual connection (skip connection)?",
     "A residual connection adds the input of a layer to its output (x + F(x)), helping gradients flow and enabling very deep networks.",
     3,["Removing layers","Adding input to output (x+F(x)) to aid gradient flow","Dropout after each layer","Batch normalisation"],1),

    ("neural-networks","🧠 Neural Networks",
     "What is the cross-entropy loss function used for?",
     "Cross-entropy loss measures the difference between predicted probability distribution and true labels, used in classification.",
     2,["Regression tasks","Measuring difference between predicted probabilities and true labels (classification)","Only binary tasks","Measuring distance between embeddings"],1),

    ("neural-networks","🧠 Neural Networks",
     "What is a hyperparameter in neural networks (give an example)?",
     "Hyperparameters are set before training, e.g. learning rate, number of layers, batch size, dropout rate.",
     1,["Weights and biases","Values set before training like learning rate, layers, batch size","Values learned during training","Only the loss function"],1),

    ("neural-networks","🧠 Neural Networks",
     "What is the role of the hidden layers in a neural network?",
     "Hidden layers learn intermediate representations, extracting increasingly abstract features from the input.",
     2,["Store training data","Learn intermediate abstract feature representations","Define input/output format","Apply loss function"],1),

    ("neural-networks","🧠 Neural Networks",
     "What is word2vec?",
     "Word2vec is a technique that learns dense word embeddings by training a shallow neural network to predict surrounding words.",
     3,["A recurrent network for text","A shallow network learning word embeddings by predicting surrounding words","A transformer model","A bag-of-words model"],1),

    ("neural-networks","🧠 Neural Networks",
     "What is the vanishing gradient solution provided by LSTM?",
     "LSTM's gating mechanisms (especially the forget gate and cell state) allow gradients to flow over long sequences without vanishing.",
     3,["Larger learning rate","Gating mechanisms and cell state allow long-range gradient flow","More dropout","Batch normalisation only"],1),

    ("neural-networks","🧠 Neural Networks",
     "What is multi-head attention in Transformers?",
     "Multi-head attention runs multiple attention operations in parallel, each learning different relationship aspects, then concatenates results.",
     3,["Single attention with multiple layers","Multiple parallel attention operations each capturing different aspects","Attention applied to multiple batches","Stacked self-attention"],1),
]

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    total = len(QUESTIONS)
    print(f"🔗 Connecting → {TURSO_URL}")

    # Create table
    print("📋 Ensuring table exists …")
    execute_sql(CREATE_SQL)
    print("   ✅ Table ready.\n")

    # Batch insert in chunks of 50
    print(f"🚀 Inserting {total} NEW questions …")
    batch = [
        (INSERT_SQL,
         [str(uuid.uuid4()), topic, subject, body, explanation,
          str(difficulty), json.dumps(options), str(correct_index)])
        for topic, subject, body, explanation, difficulty, options, correct_index in QUESTIONS
    ]

    inserted = 0
    CHUNK = 50
    for i in range(0, len(batch), CHUNK):
        execute_batch(batch[i:i+CHUNK])
        inserted += len(batch[i:i+CHUNK])
        print(f"   ✔  {inserted}/{total} inserted")

    print(f"\n✅ Done! {total} questions added to Turso.\n")

    # Summary table
    result = execute_sql("""
        SELECT topic,
               SUM(CASE WHEN difficulty=1 THEN 1 ELSE 0 END) easy,
               SUM(CASE WHEN difficulty=2 THEN 1 ELSE 0 END) medium,
               SUM(CASE WHEN difficulty=3 THEN 1 ELSE 0 END) hard,
               COUNT(*) total
        FROM questions GROUP BY topic ORDER BY topic
    """)
    rows = result["results"][0]["response"]["result"]["rows"]

    print(f"{'Topic':<25} {'Easy':>6} {'Medium':>8} {'Hard':>6} {'Grand':>7}")
    print("─" * 57)
    grand = [0, 0, 0, 0]
    for r in rows:
        t, e, m, h, tot = [c["value"] for c in r]
        print(f"{t:<25} {e:>6} {m:>8} {h:>6} {tot:>7}")
        for idx, v in enumerate([e, m, h, tot]):
            grand[idx] += int(v)
    print("─" * 57)
    print(f"{'TOTAL (all questions)':<25} {grand[0]:>6} {grand[1]:>8} {grand[2]:>6} {grand[3]:>7}")
    print(f"\n💡 Tip: original 150 + these 200 = {grand[3]} questions total in DB.")


if __name__ == "__main__":
    main()