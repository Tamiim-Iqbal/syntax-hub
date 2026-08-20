export type Subtopic = {
  _id: string;
  title: string;
  slug: string;
  order: number;
  content: string;
  code: string;
  language: string;
};

export type Topic = {
  _id: string;
  title: string;
  slug: string;
  order: number;
  content: string;
  code: string;
  language: string;
  subtopics?: Subtopic[];
};

export type CourseLanguage = {
  id: string;
  name: string;
  color: string;
  topics: Topic[];
};

export type SingleLanguageCourse = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  level: string;
  topicsCount: number;
  topics: Topic[];
  languages?: never;
};

export type MultiLanguageCourse = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  level: string;
  topicsCount: number;
  languages: CourseLanguage[];
  topics?: never;
};

export type Course = SingleLanguageCourse | MultiLanguageCourse;

export const courses: Course[] = [
  {
    _id: "course-001",
    title: "JavaScript",
    slug: "javascript",
    category: "Programming",
    description:
      "Learn JavaScript from fundamentals to modern development through a structured learning path.",
    level: "Beginner",
    topicsCount: 7,
    topics: [
      {
        _id: "js-topic-001",
        title: "Variables & Data Types",
        slug: "variables-data-types",
        order: 1,
        content:
          "Variables store values in memory. JavaScript provides let, const, and var, along with primitive and reference data types.",
        code: `let name = "Tamim";
const age = 24;
const isStudent = true;`,
        language: "javascript",
        subtopics: [
          {
            _id: "js-sub-001",
            title: "let, const & var",
            slug: "let-const-var",
            order: 1,
            content:
              "Use let when a variable may be reassigned and const when the binding should not be reassigned. var is the older function-scoped declaration.",
            code: `let score = 80;
score = 90;

const country = "Bangladesh";`,
            language: "javascript",
          },
          {
            _id: "js-sub-002",
            title: "Primitive Data Types",
            slug: "primitive-data-types",
            order: 2,
            content:
              "JavaScript primitive values include string, number, bigint, boolean, undefined, symbol, and null.",
            code: `const name = "Tamim";
const age = 24;
const active = true;
const value = null;`,
            language: "javascript",
          },
        ],
      },
      {
        _id: "js-topic-002",
        title: "Functions",
        slug: "functions",
        order: 2,
        content:
          "Functions group reusable logic. They can receive parameters and return values.",
        code: `function greet(name) {
  return "Hello " + name;
}

console.log(greet("Tamim"));`,
        language: "javascript",
      },
      {
        _id: "js-topic-003",
        title: "Arrays & Objects",
        slug: "arrays-objects",
        order: 3,
        content:
          "Arrays hold ordered collections, while objects represent data using key-value pairs.",
        code: `const users = [
  { name: "Tamim" },
  { name: "Rahim" }
];`,
        language: "javascript",
      },
      {
        _id: "js-topic-004",
        title: "Conditionals & Loops",
        slug: "conditionals-loops",
        order: 4,
        content:
          "Conditionals make decisions and loops repeat a block of code while a condition or collection requires it.",
        code: `for (let i = 0; i < 5; i++) {
  if (i % 2 === 0) {
    console.log(i);
  }
}`,
        language: "javascript",
      },
      {
        _id: "js-topic-005",
        title: "Array Methods",
        slug: "array-methods",
        order: 5,
        content:
          "Methods such as map, filter, and reduce help transform and process arrays declaratively.",
        code: `const numbers = [1, 2, 3, 4];

const doubled = numbers.map((number) => number * 2);
const even = numbers.filter((number) => number % 2 === 0);`,
        language: "javascript",
      },
      {
        _id: "js-topic-006",
        title: "ES6 & Modern JavaScript",
        slug: "es6-modern-javascript",
        order: 6,
        content:
          "Modern JavaScript introduced features such as arrow functions, destructuring, template literals, and modules.",
        code: `const add = (a, b) => a + b;

const user = { name: "Tamim", age: 24 };
const { name } = user;`,
        language: "javascript",
      },
      {
        _id: "js-topic-007",
        title: "Async JavaScript",
        slug: "async-javascript",
        order: 7,
        content:
          "Promises, async functions, and await make asynchronous JavaScript easier to write and reason about.",
        code: `async function getUser() {
  const response = await fetch("/api/user");
  return response.json();
}

getUser().then(console.log);`,
        language: "javascript",
      },
    ],
  },
  {
    _id: "course-002",
    title: "Object Oriented Programming",
    slug: "oop",
    category: "Programming",
    description:
      "Learn OOP concepts through C# and TypeScript while keeping the core concepts shared between languages.",
    level: "Intermediate",
    topicsCount: 4,
    languages: [
      {
        id: "csharp",
        name: "C#",
        color: "#68217A",
        topics: [
          {
            _id: "csharp-topic-001",
            title: "Class & Object",
            slug: "class-object",
            order: 1,
            content:
              "A class is a blueprint for creating objects. An object is an instance of a class with its own state and behavior.",
            code: `public class Student
{
    public string Name { get; set; }

    public void Introduce()
    {
        Console.WriteLine($"Hi, I am {Name}");
    }
}

var student = new Student { Name = "Tamim" };
student.Introduce();`,
            language: "csharp",
            subtopics: [
              {
                _id: "csharp-sub-001",
                title: "What is a Class?",
                slug: "what-is-a-class",
                order: 1,
                content:
                  "A class defines the data and behavior that objects created from it can have.",
                code: `public class Student
{
    public string Name { get; set; }
}`, 
                language: "csharp",
              },
              {
                _id: "csharp-sub-002",
                title: "Creating Objects",
                slug: "creating-objects",
                order: 2,
                content:
                  "Use the new keyword to create an object from a class and initialize its properties.",
                code: `var student = new Student
{
    Name = "Tamim"
};`,
                language: "csharp",
              },
              {
                _id: "csharp-sub-003",
                title: "Class Members",
                slug: "class-members",
                order: 3,
                content:
                  "Properties and methods are common class members used to represent state and behavior.",
                code: `public class Student
{
    public string Name { get; set; }

    public void Study()
    {
        Console.WriteLine("Studying...");
    }
}`,
                language: "csharp",
              },
            ],
          },
          {
            _id: "csharp-topic-002",
            title: "Constructor",
            slug: "constructor",
            order: 2,
            content:
              "Constructors run when an object is created and are commonly used to initialize its state.",
            code: `public class Student
{
    public Student(string name)
    {
        Console.WriteLine($"Student {name} created");
    }
}

var student = new Student("Tamim");`,
            language: "csharp",
          },
          {
            _id: "csharp-topic-003",
            title: "Inheritance",
            slug: "inheritance",
            order: 3,
            content:
              "Inheritance lets a derived class reuse and extend members of a base class.",
            code: `public class Animal
{
    public void Eat() => Console.WriteLine("Eating");
}

public class Dog : Animal
{
    public void Bark() => Console.WriteLine("Bark");
}`,
            language: "csharp",
          },
          {
            _id: "csharp-topic-004",
            title: "Polymorphism",
            slug: "polymorphism",
            order: 4,
            content:
              "Polymorphism allows one interface or base type to represent different concrete implementations.",
            code: `public class Animal
{
    public virtual void Sound()
    {
        Console.WriteLine("Animal sound");
    }
}

public class Dog : Animal
{
    public override void Sound()
    {
        Console.WriteLine("Bark");
    }
}`,
            language: "csharp",
          },
        ],
      },
      {
        id: "typescript",
        name: "TypeScript",
        color: "#3178C6",
        topics: [
          {
            _id: "typescript-topic-001",
            title: "Class & Object",
            slug: "class-object",
            order: 1,
            content:
              "A class describes the shape and behavior of objects. TypeScript adds static typing on top of JavaScript classes.",
            code: `class Student {
  constructor(public name: string) {}

  introduce() {
    console.log(\`Hi, I am \${this.name}\`);
  }
}

const student = new Student("Tamim");
student.introduce();`,
            language: "typescript",
            subtopics: [
              {
                _id: "typescript-sub-001",
                title: "What is a Class?",
                slug: "what-is-a-class",
                order: 1,
                content:
                  "A TypeScript class defines the properties and methods that its objects can use.",
                code: `class Student {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}`,
                language: "typescript",
              },
              {
                _id: "typescript-sub-002",
                title: "Creating Objects",
                slug: "creating-objects",
                order: 2,
                content:
                  "Create an object with new and pass values that satisfy the constructor's parameter types.",
                code: `const student = new Student("Tamim");`,
                language: "typescript",
              },
              {
                _id: "typescript-sub-003",
                title: "Class Members",
                slug: "class-members",
                order: 3,
                content:
                  "Properties, methods, and access modifiers are commonly used as TypeScript class members.",
                code: `class Student {
  private name: string;

  study(): void {
    console.log("Studying...");
  }
}`,
                language: "typescript",
              },
            ],
          },
          {
            _id: "typescript-topic-002",
            title: "Constructor",
            slug: "constructor",
            order: 2,
            content:
              "A TypeScript constructor initializes an object and can use parameter properties to reduce boilerplate.",
            code: `class Student {
  constructor(public name: string) {}
}

const student = new Student("Tamim");`,
            language: "typescript",
          },
          {
            _id: "typescript-topic-003",
            title: "Inheritance",
            slug: "inheritance",
            order: 3,
            content:
              "A class can extend another class and reuse its properties and methods.",
            code: `class Animal {
  eat() {
    console.log("Eating");
  }
}

class Dog extends Animal {
  bark() {
    console.log("Bark");
  }
}`,
            language: "typescript",
          },
          {
            _id: "typescript-topic-004",
            title: "Polymorphism",
            slug: "polymorphism",
            order: 4,
            content:
              "Polymorphism lets different classes satisfy the same contract while providing their own implementation.",
            code: `interface Animal {
  sound(): string;
}

class Dog implements Animal {
  sound() {
    return "Bark";
  }
}`,
            language: "typescript",
          },
        ],
      },
    ],
  },
];
