import random from "random";

export const choose = (arr) => arr[random.int(0, arr.length - 1)];

export default choose;
