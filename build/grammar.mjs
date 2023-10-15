#! /usr/bin/env node

import { readdirSync, readFileSync, writeFileSync } from "fs";
import { parse } from "yaml";

const dir = "syntaxes/";
const yamlOptions = {
  merge: true, // Merge maps with `<<` key.
};

const files = readdirSync(dir).filter((file) => file.endsWith(".yaml"));
for (var yamlFile of files) {
  yamlFile = dir + yamlFile;
  const jsonFile = yamlFile.replace(/\.yaml$/, ".json");

  console.log(`Processing grammar file: ${yamlFile}`);

  const yamlString = readFileSync(yamlFile, "utf8");
  const grammar = parse(yamlString, yamlOptions);
  const jsonString = JSON.stringify(grammar, null, "  ") + "\n";

  writeFileSync(jsonFile, jsonString);
}
