import { Readable, Writable } from "stream";
import { Page, createPage } from "./index";

/**
 * This function pipe a Readable Stream into a Writable stream in order to pass
 * the response to the server from to the client. This is usefull to act as a proxy
 * and avoid to buffer all the response body in the current process.
 *
 * @param source
 * @param dest
 */
export function pipe(source: Readable, dest: Writable): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    source.pipe(dest);

    source.on("end", (err: Error) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * This function pipe a Readable Stream into an internal buffer so it is possible
 * to reuse the buffer to create a Page object.
 *
 * @param source
 */
export function pipePageToClient(source: Readable): Promise<Page> {
  let data = "";
  const dest = new Writable({
    write(chunk, _, callback) {
      data += chunk;

      callback();
    },
  });

  return pipe(source, dest).then(() => {
    return createPage(JSON.parse(data));
  });
}
