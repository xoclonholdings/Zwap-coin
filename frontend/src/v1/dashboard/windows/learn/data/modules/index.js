import { foundationModules } from "./foundations";
import { wellnessModules } from "./wellness";
import { selfHelpModules } from "./selfHelp";
import { personalDevelopmentModules } from "./personalDevelopment";
import { aiModules } from "./ai";
import { web3Modules } from "./web3";
import { zwapModules } from "./zwap";

const allModules = [
  ...foundationModules,
  ...wellnessModules,
  ...selfHelpModules,
  ...personalDevelopmentModules,
  ...aiModules,
  ...web3Modules,
  ...zwapModules,
];

function byLevel(level) {
  return allModules.filter(
    (module) => String(module.level || "").toLowerCase() === level
  );
}

export const beginner = byLevel("beginner");
export const intermediate = byLevel("intermediate");
export const advanced = byLevel("advanced");
export const expert = byLevel("expert");

export const moduleCategories = {
  foundations: foundationModules,
  wellness: wellnessModules,
  selfHelp: selfHelpModules,
  personalDevelopment: personalDevelopmentModules,
  ai: aiModules,
  web3: web3Modules,
  zwap: zwapModules,
};

export const learnModuleList = allModules;