interface ProjectItemInterface {
  project: string;
  configChanges: configChangesInterface | string;
}

interface configChangesInterface {
  changes: {
    file: string;
    diff: string;
  };
  link: string;
}

export const prepareTable = (data: ProjectItemInterface[]): string => {
  let asciiTable = '<pre><code>Project                  | Изменения в конфиге\n' + '-------------------------|----------------\n';
  const links = [];

  data.forEach((item) => {
    const projectName = item.project;
    const configChangesText = item.configChanges !== 'No changes ❌' ? `Есть изменения в конфиге` : 'Без изменений ❌';

    asciiTable += `${projectName}| ${configChangesText}\n`;

    // Prepare links for later
    if (item.configChanges !== 'No changes ❌' && item.configChanges.link) {
      links.push(`<a href="${item.configChanges.link}">Изменения в конфиге ${projectName}</a>`);
    }
  });

  asciiTable += '</code></pre>';

  // Append links outside of the monospaced block
  if (links.length > 0) {
    asciiTable += '\n' + links.join('\n');
  }

  return asciiTable;
};
