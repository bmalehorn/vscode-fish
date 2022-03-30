import { glob } from "glob";
import * as Mocha from "mocha";
import * as path from "path";

export function run(): Promise<void> {
  const testRoot = path.resolve(__dirname);
  const mocha = new Mocha({ ui: "tdd" });

  return new Promise((resolve, reject) => {
    glob("**/*.test.js", { cwd: testRoot }, (error, files) => {
      if (error) {
        reject(error);
      }

      files.forEach((file) => mocha.addFile(path.resolve(testRoot, file)));

      try {
        mocha.run((failures) => {
          if (failures > 0) {
            reject(new Error(`${failures} tests failed.`));
          } else {
            resolve();
          }
        });
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  });
}
