// TODO saving this space in case I want to support multiple workers

export default function(){
  let workerURL = new URL('./worker.js', document.currentScript.src);
  return new Worker(workerURL);
};
