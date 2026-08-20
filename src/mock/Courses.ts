export type Subtopic = {
  _id: string;
  title: LocalizedText;
  slug: string;
  order: number;
  content: LocalizedText;
  code: string;
  language: string;
};

export type Topic = {
  _id: string;
  title: LocalizedText;
  slug: string;
  order: number;
  content: LocalizedText;
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

export type LocalizedText =
  | string
  | {
      bn: string;
      en: string;
    };

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
        title: {
          bn: "Variables & Data Types",
          en: "Variables & Data Types",
        },
        slug: "variables-data-types",
        order: 1,
        content: {
          bn: "Variables store values in memory. JavaScript provides let, const, and var, along with primitive and reference data types.",
          en: "Variables store values in memory. JavaScript provides let, const, and var, along with primitive and reference data types.",
        },
        code: `let name = "Tamim";
const age = 24;
const isStudent = true;`,
        language: "javascript",
        subtopics: [
          {
            _id: "js-sub-001",
            title: {
          bn: "let, const & var",
          en: "let, const & var",
        },
            slug: "let-const-var",
            order: 1,
            content: {
          bn: "Use let when a variable may be reassigned and const when the binding should not be reassigned. var is the older function-scoped declaration.",
          en: "Use let when a variable may be reassigned and const when the binding should not be reassigned. var is the older function-scoped declaration.",
        },
            code: `let score = 80;
score = 90;

const country = "Bangladesh";`,
            language: "javascript",
          },
          {
            _id: "js-sub-002",
            title: {
          bn: "Primitive Data Types",
          en: "Primitive Data Types",
        },
            slug: "primitive-data-types",
            order: 2,
            content: {
          bn: "JavaScript primitive values include string, number, bigint, boolean, undefined, symbol, and null.",
          en: "JavaScript primitive values include string, number, bigint, boolean, undefined, symbol, and null.",
        },
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
        title: {
          bn: "Functions",
          en: "Functions",
        },
        slug: "functions",
        order: 2,
        content: {
          bn: "Functions group reusable logic. They can receive parameters and return values.",
          en: "Functions group reusable logic. They can receive parameters and return values.",
        },
        code: `function greet(name) {
  return "Hello " + name;
}

console.log(greet("Tamim"));`,
        language: "javascript",
      },
      {
        _id: "js-topic-003",
        title: {
          bn: "Arrays & Objects",
          en: "Arrays & Objects",
        },
        slug: "arrays-objects",
        order: 3,
        content: {
          bn: "Arrays hold ordered collections, while objects represent data using key-value pairs.",
          en: "Arrays hold ordered collections, while objects represent data using key-value pairs.",
        },
        code: `const users = [
  { name: "Tamim" },
  { name: "Rahim" }
];`,
        language: "javascript",
      },
      {
        _id: "js-topic-004",
        title: {
          bn: "Conditionals & Loops",
          en: "Conditionals & Loops",
        },
        slug: "conditionals-loops",
        order: 4,
        content: {
          bn: "Conditionals make decisions and loops repeat a block of code while a condition or collection requires it.",
          en: "Conditionals make decisions and loops repeat a block of code while a condition or collection requires it.",
        },
        code: `for (let i = 0; i < 5; i++) {
  if (i % 2 === 0) {
    console.log(i);
  }
}`,
        language: "javascript",
      },
      {
        _id: "js-topic-005",
        title: {
          bn: "Array Methods",
          en: "Array Methods",
        },
        slug: "array-methods",
        order: 5,
        content: {
          bn: "Methods such as map, filter, and reduce help transform and process arrays declaratively.",
          en: "Methods such as map, filter, and reduce help transform and process arrays declaratively.",
        },
        code: `const numbers = [1, 2, 3, 4];

const doubled = numbers.map((number) => number * 2);
const even = numbers.filter((number) => number % 2 === 0);`,
        language: "javascript",
      },
      {
        _id: "js-topic-006",
        title: {
          bn: "ES6 & Modern JavaScript",
          en: "ES6 & Modern JavaScript",
        },
        slug: "es6-modern-javascript",
        order: 6,
        content: {
          bn: "Modern JavaScript introduced features such as arrow functions, destructuring, template literals, and modules.",
          en: "Modern JavaScript introduced features such as arrow functions, destructuring, template literals, and modules.",
        },
        code: `const add = (a, b) => a + b;

const user = { name: "Tamim", age: 24 };
const { name } = user;`,
        language: "javascript",
      },
      {
        _id: "js-topic-007",
        title: {
          bn: "Async JavaScript",
          en: "Async JavaScript",
        },
        slug: "async-javascript",
        order: 7,
        content: {
          bn: "Promises, async functions, and await make asynchronous JavaScript easier to write and reason about.",
          en: "Promises, async functions, and await make asynchronous JavaScript easier to write and reason about.",
        },
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
            title: {
          bn: "Class & Object",
          en: "Class & Object",
        },
            slug: "class-object",
            order: 1,
            content: {
          bn: "A class is a blueprint for creating objects. An object is an instance of a class with its own state and behavior.",
          en: "A class is a blueprint for creating objects. An object is an instance of a class with its own state and behavior.",
        },
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
                title: {
          bn: "What is a Class?",
          en: "What is a Class?",
        },
                slug: "what-is-a-class",
                order: 1,
                content: {
          bn: "A class defines the data and behavior that objects created from it can have.",
          en: "A class defines the data and behavior that objects created from it can have.",
        },
                code: `public class Student
{
    public string Name { get; set; }
}`, 
                language: "csharp",
              },
              {
                _id: "csharp-sub-002",
                title: {
          bn: "Creating Objects",
          en: "Creating Objects",
        },
                slug: "creating-objects",
                order: 2,
                content: {
          bn: "Use the new keyword to create an object from a class and initialize its properties.",
          en: "Use the new keyword to create an object from a class and initialize its properties.",
        },
                code: `var student = new Student
{
    Name = "Tamim"
};`,
                language: "csharp",
              },
              {
                _id: "csharp-sub-003",
                title: {
          bn: "Class Members",
          en: "Class Members",
        },
                slug: "class-members",
                order: 3,
                content: {
          bn: "Properties and methods are common class members used to represent state and behavior.",
          en: "Properties and methods are common class members used to represent state and behavior.",
        },
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
            title: {
          bn: "Constructor",
          en: "Constructor",
        },
            slug: "constructor",
            order: 2,
            content: {
          bn: "Constructors run when an object is created and are commonly used to initialize its state.",
          en: "Constructors run when an object is created and are commonly used to initialize its state.",
        },
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
            title: {
          bn: "Inheritance",
          en: "Inheritance",
        },
            slug: "inheritance",
            order: 3,
            content: {
          bn: "Inheritance lets a derived class reuse and extend members of a base class.",
          en: "Inheritance lets a derived class reuse and extend members of a base class.",
        },
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
            title: {
          bn: "Polymorphism",
          en: "Polymorphism",
        },
            slug: "polymorphism",
            order: 4,
            content: {
          bn: "Polymorphism allows one interface or base type to represent different concrete implementations.",
          en: "Polymorphism allows one interface or base type to represent different concrete implementations.",
        },
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
            title: {
          bn: "Class & Object",
          en: "Class & Object",
        },
            slug: "class-object",
            order: 1,
            content: {
          bn: "A class describes the shape and behavior of objects. TypeScript adds static typing on top of JavaScript classes.",
          en: "A class describes the shape and behavior of objects. TypeScript adds static typing on top of JavaScript classes.",
        },
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
                title: {
          bn: "What is a Class?",
          en: "What is a Class?",
        },
                slug: "what-is-a-class",
                order: 1,
                content: {
          bn: "A TypeScript class defines the properties and methods that its objects can use.",
          en: "A TypeScript class defines the properties and methods that its objects can use.",
        },
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
                title: {
          bn: "Creating Objects",
          en: "Creating Objects",
        },
                slug: "creating-objects",
                order: 2,
                content: {
          bn: "Create an object with new and pass values that satisfy the constructor's parameter types.",
          en: "Create an object with new and pass values that satisfy the constructor's parameter types.",
        },
                code: `const student = new Student("Tamim");`,
                language: "typescript",
              },
              {
                _id: "typescript-sub-003",
                title: {
          bn: "Class Members",
          en: "Class Members",
        },
                slug: "class-members",
                order: 3,
                content: {
          bn: "Properties, methods, and access modifiers are commonly used as TypeScript class members.",
          en: "Properties, methods, and access modifiers are commonly used as TypeScript class members.",
        },
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
            title: {
          bn: "Constructor",
          en: "Constructor",
        },
            slug: "constructor",
            order: 2,
            content: {
          bn: "A TypeScript constructor initializes an object and can use parameter properties to reduce boilerplate.",
          en: "A TypeScript constructor initializes an object and can use parameter properties to reduce boilerplate.",
        },
            code: `class Student {
  constructor(public name: string) {}
}

const student = new Student("Tamim");`,
            language: "typescript",
          },
          {
            _id: "typescript-topic-003",
            title: {
          bn: "Inheritance",
          en: "Inheritance",
        },
            slug: "inheritance",
            order: 3,
            content: {
          bn: "A class can extend another class and reuse its properties and methods.",
          en: "A class can extend another class and reuse its properties and methods.",
        },
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
            title: {
          bn: "Polymorphism",
          en: "Polymorphism",
        },
            slug: "polymorphism",
            order: 4,
            content: {
          bn: "Polymorphism lets different classes satisfy the same contract while providing their own implementation.",
          en: "Polymorphism lets different classes satisfy the same contract while providing their own implementation.",
        },
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