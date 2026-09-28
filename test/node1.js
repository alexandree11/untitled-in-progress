const students = [
  { name: "Alex", score: 85 },
  { name: "Elsa", score: 92 },
  { name: "John", score: 60 },
  { name: "Kate", score: 78 },
  { name: "Mark", score: 88 }
];

const students_passed = students
    .filter(students => students.score >= 80)
    .map(students => students.name.toUpperCase());

console.log(students_passed);