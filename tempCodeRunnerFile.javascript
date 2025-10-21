let person = {
    fname: "test",
    lname: "test2",
    age: 24,
    display() {
        return fname + " " + lname;
    }
};

for (let key in person) {
    let v = person[key];
    if (typeof v === 'function') {
        console.log(v());
        console.log(typeof v);
        console.log(v);
        console.log(v.call(person));
    } else {
        console.log(v);
    }
}

console.log("----");

for (let key in person) {
    // let v = person[key];
    if (typeof key === 'function') {
        console.log(person[key]());
        console.log(typeof person[key]);
        console.log(person[key]);
        console.log(person[key].call(person));
    } else {
        console.log(person[key]);
    }
}

console.log("----");

for (let key in person) {
    console.log(person[key]);
}
