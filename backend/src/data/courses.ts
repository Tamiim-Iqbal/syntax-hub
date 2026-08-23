export const courses = [
  {
    _id: "course-001",
    title: "JavaScript",
    slug: "javascript",
    category: "Programming",
    type: "single-language",
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
    type: "multi-language",
    description:
      "Learn OOP concepts through C# and TypeScript while keeping the core concepts shared between languages.",
    level: "Intermediate",
    topicsCount: 4,
    languages: [
      {
        id: "csharp",
        name: "C#",
        color: "#a738c3",
        topics: [
          {
            _id: "csharp-topic-001",
            title: {
              bn: "Class & Object",
              en: "Class & Object",
            },
            slug: "class-object",
            order: 1,
            sections: [
              {
                type: "explanation",
                content: {
                  bn: [
                    "A ",
                    { type: "bold", text: "class" },
                    " is a blueprint for creating ",
                    { type: "inline-code", text: "objects" },
                    ". An ",
                    { type: "highlight", text: "object" },
                    " is an instance of a class with its own state and behavior.",
                  ],
                  en: [
                    "A ",
                    { type: "bold", text: "class" },
                    " is a blueprint for creating ",
                    { type: "inline-code", text: "objects" },
                    ". An ",
                    { type: "highlight", text: "object" },
                    " is an instance of a class with its own state and behavior.",
                  ],
                },
              },

              {
                type: "code",
                language: "csharp",
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
              },
              {
                type: "explanation",
                content: {
                  bn: "Here, Student is the class and student is an object created from that class.",
                  en: "Here, Student is the class and student is an object created from that class.",
                },
              },
              {
                type: "only-text",
                content: {
                  bn: "Class হলো object তৈরি করার blueprint। Object হলো সেই class-এর একটি instance।",
                  en: "A class is a blueprint for creating objects. An object is an instance of that class.",
                },
              },

              {
                type: "bullet-points",
                items: [
                  {
                    bn: "Class object-এর properties এবং behavior define করে।",
                    en: "A class defines the properties and behavior of an object.",
                  },
                  {
                    bn: "একটি class থেকে একাধিক object তৈরি করা যায়।",
                    en: "Multiple objects can be created from a single class.",
                  },
                  {
                    bn: "প্রতিটি object-এর নিজের state থাকতে পারে।",
                    en: "Each object can have its own state.",
                  },
                ],
              },
              {
                type: "image",
                src: "https://media.licdn.com/dms/image/v2/D4D12AQFf_cR1jkHHsQ/article-cover_image-shrink_720_1280/B4DZw2X4ZoKkAI-/0/1770438763960?e=2147483647&v=beta&t=BLPbzFJ1t-fBmk9FujTgLCj3ZWcqOwG6mZEKz1NXneo",
                alt: "C# Class and Object example",
                caption: {
                  bn: "C# Class ও Object-এর উদাহরণ",
                  en: "C# Class and Object example",
                },
              },
            ],
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
                sections: [
                  {
                    type: "explanation",
                    content: {
                      bn: ["A class defines the data and behavior that",
                        {
                          type: "highlight",
                          text: "objects"
                        }, "created from it can have."],
                      en: ["A class defines the data and behavior that",
                        {
                          type: "highlight",
                          text: "objects"
                        }, "created from it can have."],
                    },
                  },
                  {
                    type: "code",
                    language: "csharp",
                    code: `public class Student
{
    public string Name { get; set; }
}`,
                  },
                  {
                    type: "explanation",
                    content: {
                      bn: "Here, Student is the class and Name is a property of that class.",
                      en: "Here, Student is the class and Name is a property of that class.",
                    },
                  },
                  {
                    type: "code",
                    language: "csharp",
                    code: `var student = new Student();
student.Name = "Tamim";`,
                  },
                ],
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
  {
    _id: "course-003",
    title: "Problem Solving",
    slug: "problem-solving",
    category: "Problem Solving",
    type: "problem-solving",
    description:
      "Improve your programming skills through carefully selected problems from different online judges.",
    level: "Beginner",
    topicsCount: 2,

    content: {
      categories: [
        {
          _id: "ps-category-001",
          title: {
            bn: "Basic Problem Solving",
            en: "Basic Problem Solving",
          },
          slug: "basic",
          description: {
            bn: "Programming fundamentals-এর উপর ভিত্তি করে basic problems solve করুন।",
            en: "Practice basic problems based on fundamental programming concepts.",
          },
          order: 1,
          problems: [
            {
              _id: "problem-001",
              title: {
                bn: "Two Sum",
                en: "Two Sum",
              },
              slug: "two-sum",
              order: 1,
              difficulty: "easy",
              judge: "LeetCode",
              judgeUrl: "https://leetcode.com/problems/two-sum/",
              problemNumber: "1",
              topics: ["array", "hash-map"],
              problem: {
                title: {
                  bn: "Two Sum",
                  en: "Two Sum",
                },

                description: {
                  bn: "একটি integer array এবং একটি target দেওয়া হলে এমন দুটি সংখ্যার index খুঁজে বের করুন যাদের যোগফল target-এর সমান।",
                  en: "Given an integer array and a target, find the indices of two numbers whose sum equals the target.",
                },

                examples: [
                  {
                    input: "nums = [2,7,11,15], target = 9",
                    output: "[0,1]",
                    explanation: {
                      bn: "nums[0] + nums[1] = 2 + 7 = 9",
                      en: "nums[0] + nums[1] = 2 + 7 = 9",
                    },
                  },
                ],

                constraints: [
                  {
                    bn: "2 ≤ nums.length ≤ 10⁴",
                    en: "2 ≤ nums.length ≤ 10⁴",
                  },
                  {
                    bn: "প্রতিটি input-এর একটি মাত্র solution থাকবে।",
                    en: "Each input will have exactly one solution.",
                  },
                ],
              },

              approach: {
                title: {
                  bn: "Hash Map ব্যবহার করে সমাধান",
                  en: "Solve using a Hash Map",
                },

                sections: [
                  {
                    type: "only-text",
                    content: {
                      bn: "আমরা array একবার traverse করব এবং প্রতিটি সংখ্যার complement hash map-এ আছে কিনা check করব।",
                      en: "We traverse the array once and check whether the complement of each number already exists in a hash map.",
                    },
                  },

                  {
                    type: "bullet-points",
                    items: [
                      {
                        bn: "প্রতিটি সংখ্যার complement বের করুন।",
                        en: "Calculate the complement for each number.",
                      },
                      {
                        bn: "Complement hash map-এ থাকলে দুইটি index পাওয়া গেছে।",
                        en: "If the complement exists in the hash map, we found the two indices.",
                      },
                      {
                        bn: "না থাকলে current number-টি hash map-এ store করুন।",
                        en: "Otherwise, store the current number in the hash map.",
                      },
                    ],
                  },
                ],
              },

              solutions: [
                {
                  language: "javascript",
                  label: "JavaScript",
                  code: `function twoSum(nums, target) {
  const map = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (map.has(complement)) {
      return [map.get(complement), i];
    }

    map.set(nums[i], i);
  }
}`,
                },

                {
                  language: "cpp",
                  label: "C++",
                  code: `vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> map;

    for (int i = 0; i < nums.size(); i++) {
        int complement = target - nums[i];

        if (map.count(complement)) {
            return {map[complement], i};
        }

        map[nums[i]] = i;
    }

    return {};
}`,
                },

                {
                  language: "python",
                  label: "Python",
                  code: `def two_sum(nums, target):
    seen = {}

    for i, num in enumerate(nums):
        complement = target - num

        if complement in seen:
            return [seen[complement], i]

        seen[num] = i

    return []`,
                },
              ],
            },
            {
              _id: "problem-002",
              title: {
                bn: "Reverse String",
                en: "Reverse String",
              },
              slug: "reverse-string",
              order: 2,
              difficulty: "easy",
              judge: "LeetCode",
              judgeUrl: "https://leetcode.com/problems/reverse-string/",
              problemNumber: "344",
              topics: ["string", "two-pointers"],
              problem: {
                title: {
                  bn: "Reverse String",
                  en: "Reverse String",
                },

                description: {
                  bn: "একটি character array দেওয়া হলে সেটিকে in-place reverse করুন।",
                  en: "Given a character array, reverse the array in-place.",
                },

                examples: [
                  {
                    input: 's = ["h","e","l","l","o"]',
                    output: '["o","l","l","e","h"]',
                    explanation: {
                      bn: "Array-টির প্রথম এবং শেষ element swap করতে থাকুন।",
                      en: "Keep swapping the first and last elements.",
                    },
                  },
                ],

                constraints: [
                  {
                    bn: "1 ≤ s.length ≤ 10⁵",
                    en: "1 ≤ s.length ≤ 10⁵",
                  },
                  {
                    bn: "s-এর প্রতিটি element একটি printable character।",
                    en: "Each element of s is a printable character.",
                  },
                ],
              },

              approach: {
                title: {
                  bn: "Two Pointer ব্যবহার করে সমাধান",
                  en: "Solve using Two Pointers",
                },

                sections: [
                  {
                    type: "only-text",
                    content: {
                      bn: "Array-এর শুরুতে একটি pointer এবং শেষে আরেকটি pointer রাখব। তারপর দুই পাশের character swap করব যতক্ষণ না pointer দুটি একে অপরকে cross করে।",
                      en: "Use one pointer at the beginning and another at the end. Swap the characters from both sides until the pointers cross.",
                    },
                  },

                  {
                    type: "bullet-points",
                    items: [
                      {
                        bn: "একটি left pointer এবং একটি right pointer নিন।",
                        en: "Take a left pointer and a right pointer.",
                      },
                      {
                        bn: "দুই pointer-এর character swap করুন।",
                        en: "Swap the characters at the two pointers.",
                      },
                      {
                        bn: "left বাড়ান এবং right কমান।",
                        en: "Increment left and decrement right.",
                      },
                      {
                        bn: "pointer দুটি cross করলে loop শেষ করুন।",
                        en: "Stop when the two pointers cross.",
                      },
                    ],
                  },
                ],
              },

              solutions: [
                {
                  language: "javascript",
                  label: "JavaScript",
                  code: `function reverseString(s) {
  let left = 0;
  let right = s.length - 1;

  while (left < right) {
    [s[left], s[right]] = [s[right], s[left]];

    left++;
    right--;
  }
}`,
                },

                {
                  language: "cpp",
                  label: "C++",
                  code: `void reverseString(vector<char>& s) {
    int left = 0;
    int right = s.size() - 1;

    while (left < right) {
        swap(s[left], s[right]);

        left++;
        right--;
    }
}`,
                },

                {
                  language: "python",
                  label: "Python",
                  code: `def reverse_string(s):
    left = 0
    right = len(s) - 1

    while left < right:
        s[left], s[right] = s[right], s[left]

        left += 1
        right -= 1`,
                },
              ],
            },
          ],
        },

        {
          _id: "ps-category-002",
          title: {
            bn: "Data Structure Problems",
            en: "Data Structure Problems",
          },
          slug: "dsa",
          description: {
            bn: "Array, Stack, Queue এবং অন্যান্য data structure নিয়ে problem solve করুন।",
            en: "Practice problems involving arrays, stacks, queues, and other data structures.",
          },
          order: 2,
          problems: [
            {
              _id: "problem-003",
              title: {
                bn: "Valid Parentheses",
                en: "Valid Parentheses",
              },
              slug: "valid-parentheses",
              order: 1,
              difficulty: "easy",
              judge: "LeetCode",
              judgeUrl: "https://leetcode.com/problems/valid-parentheses/",
              problemNumber: "20",
              topics: ["stack", "string"],
              problem: {
                title: {
                  bn: "Valid Parentheses",
                  en: "Valid Parentheses",
                },

                description: {
                  bn: "একটি string-এর parentheses সঠিকভাবে balanced এবং properly nested কিনা নির্ধারণ করুন।",
                  en: "Determine whether the parentheses in a string are valid and properly nested.",
                },

                examples: [
                  {
                    input: 's = "()"',
                    output: "true",
                    explanation: {
                      bn: "Opening এবং closing parentheses সঠিকভাবে match করেছে।",
                      en: "The opening and closing parentheses match correctly.",
                    },
                  },
                  {
                    input: 's = "([)]"',
                    output: "false",
                    explanation: {
                      bn: "Parentheses-এর order সঠিক নয়।",
                      en: "The parentheses are not properly ordered.",
                    },
                  },
                ],

                constraints: [
                  {
                    bn: "1 ≤ s.length ≤ 10⁴",
                    en: "1 ≤ s.length ≤ 10⁴",
                  },
                  {
                    bn: "s শুধুমাত্র (, ), {, }, [, ] characters ধারণ করে।",
                    en: "s contains only (, ), {, }, [, ] characters.",
                  },
                ],
              },

              approach: {
                title: {
                  bn: "Stack ব্যবহার করে সমাধান",
                  en: "Solve using a Stack",
                },

                sections: [
                  {
                    type: "only-text",
                    content: {
                      bn: "Opening bracket দেখলে stack-এ push করব। Closing bracket দেখলে stack-এর top-এর সাথে match করছে কিনা check করব।",
                      en: "Push opening brackets onto the stack. When a closing bracket appears, check whether it matches the top of the stack.",
                    },
                  },

                  {
                    type: "bullet-points",
                    items: [
                      {
                        bn: "Opening bracket stack-এ push করুন।",
                        en: "Push opening brackets onto the stack.",
                      },
                      {
                        bn: "Closing bracket-এর matching opening bracket check করুন।",
                        en: "Check for the matching opening bracket.",
                      },
                      {
                        bn: "Match না করলে false return করুন।",
                        en: "Return false if they do not match.",
                      },
                      {
                        bn: "শেষে stack empty হলে string valid।",
                        en: "The string is valid if the stack is empty at the end.",
                      },
                    ],
                  },
                ],
              },

              solutions: [
                {
                  language: "javascript",
                  label: "JavaScript",
                  code: `function isValid(s) {
  const stack = [];
  const pairs = {
    ")": "(",
    "]": "[",
    "}": "{"
  };

  for (const char of s) {
    if (char === "(" || char === "[" || char === "{") {
      stack.push(char);
    } else {
      if (stack.pop() !== pairs[char]) {
        return false;
      }
    }
  }

  return stack.length === 0;
}`,
                },

                {
                  language: "cpp",
                  label: "C++",
                  code: `bool isValid(string s) {
    stack<char> st;

    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') {
            st.push(c);
        } else {
            if (st.empty()) return false;

            char top = st.top();
            st.pop();

            if ((c == ')' && top != '(') ||
                (c == ']' && top != '[') ||
                (c == '}' && top != '{')) {
                return false;
            }
        }
    }

    return st.empty();
}`,
                },

                {
                  language: "python",
                  label: "Python",
                  code: `def is_valid(s):
    stack = []
    pairs = {
        ")": "(",
        "]": "[",
        "}": "{"
    }

    for char in s:
        if char in "([{":
            stack.append(char)
        else:
            if not stack or stack.pop() != pairs[char]:
                return False

    return len(stack) == 0`,
                },
              ],
            },
          ],
        },
      ],
    },
  },
];