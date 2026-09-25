async function test() {
  const res = await fetch("http://localhost:3000/api/rss-proxy?url=invalid.com");
  console.log("Status:", res.status);
  try {
    const text = await res.text();
    console.log("Response:", text.substring(0, 200));
  } catch(e) {
    console.log("Error:", e);
  }
}
test();
