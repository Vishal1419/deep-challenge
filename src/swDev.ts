const swDev = async () => {
  let swUrl = `${process.env.PUBLIC_URL}/sw.js`;
  const response = await navigator.serviceWorker.register(swUrl);
  console.log(response);
}

export default swDev;
