const header = document.getElementById("header");
const footer = document.getElementById("footer");

const getHeaderFooter = async () => {
  const res1 = await (await fetch("header.html")).text();
  const res2 = await (await fetch("footer.html")).text();
};

getHeaderFooter();
