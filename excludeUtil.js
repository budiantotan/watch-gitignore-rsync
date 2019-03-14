const fs = require('fs');
const parse = require('parse-gitignore');
const find = require('find');
const anymatch = require('anymatch');

const getExcludedList = (source, includes) => {
  try {
    return find
      // search for .gitignore files
      .fileSync(/\.gitignore$/, source)
      .reduce((fileList, gitIgnore) => {
        try {
          // get current .gitignore directory
          const fileDir = gitIgnore
            .replace(`${source}/`, '')
            .replace('.gitignore', '');

          // parse .gitignore file
          return fileList.concat(
            parse(fs.readFileSync(gitIgnore))
              .map(file => {
                // excluding based on the args
                if (anymatch(includes, file)) {
                  return '';
                };
                return `${fileDir}${file}`
              })
              .filter(Boolean)
          )
        } catch (e) {
          console.warn(`Cannot parse .gitignore file at ${gitIgnore}`);
          return fileList;
        }
      }, [])
  } catch (e) {
    console.warn(`Cannot compile ignored files from .gitignore ${e}`);
    return [];
  }
}

const getExcludedRegex = (source, includes) => {
  const excludedList = getExcludedList(source, includes);

  return excludedList
    .reduce((prev, curr) => prev += `${curr}|`, '')
    .slice(0, -1);
}

const getExcludedArguments = (source, includes, argumentFlag = '--exclude') => {
  const excludedList = getExcludedList(source, includes);

  return excludedList
    .reduce((prev, curr) => prev += `${argumentFlag} "${curr}" `, '')
}

module.exports = {
  getExcludedList,
  getExcludedRegex,
  getExcludedArguments,
}
