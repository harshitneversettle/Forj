const { default: axios } = require("axios");

const map = {};

async function hello() {
  const res = await axios("https://jsonplaceholder.typicode.com/todos/");
  //   console.log(res.data);

  const arr = res.data;

  arr.forEach((i) => {
    const userId = i["userId"];
    const todo = i["title"];
    if (map[userId] === undefined) {
      map[userId] = [todo];
    } else {
      map[userId] = [...map[userId], todo];
    }
  });

  console.log(map);
}

hello();
