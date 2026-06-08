export function chunkText(
text,
chunkSize = 2500,
overlap = 400
) {

const chunks = [];

let start = 0;

while (start < text.length) {


const end =
  start + chunkSize;

chunks.push(
  text.slice(start, end)
);

start +=
  chunkSize - overlap;


}

return chunks;
}
