import { getRegisteredDays } from "./utils";
import caporal from "caporal";

require("./Dec1");
require("./Dec2");
require("./Dec3");
require("./Dec4");
require("./Dec5");
require("./Dec6");
require("./Dec7");
require("./Dec8");
require("./Dec9");
require("./Dec10");
require("./Dec11");
require("./Dec12");
require("./Dec13");
require("./Dec14");
require("./Dec15");
require("./Dec16");

const registeredDays = getRegisteredDays();

caporal
  .version("0.1.0")
  .argument("[day]", "Day to run", Object.keys(registeredDays).map(String))
  .action((args) => {
    if (args.day === undefined) {
      Object.keys(registeredDays)
        .sort((a, b) => parseFloat(a) - parseFloat(b))
        .forEach((day) => registeredDays[parseFloat(day)]());
    } else {
      registeredDays[args.day]();
    }
  });

caporal.parse(process.argv);
