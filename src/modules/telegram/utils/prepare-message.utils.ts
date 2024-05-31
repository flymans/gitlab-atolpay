interface BuildMessageInterface {
  isStarted: boolean;
  buildIdentifier: string;
  link?: string;
  name: string;
  stage?: string;
}

const tryDecodeBase64 = (str: string): string => {
  try {
    return atob(str);
  } catch (error) {
    return str;
  }
};

export const prepareBuildMessage = ({ isStarted, buildIdentifier, link, name, stage }: BuildMessageInterface) => {
  const project = `${name}${stage ? `:${stage}` : ''}`;
  return `${isStarted ? '⌛ ' : '✅ '}Сборка <b>${project}</b> на ветке <i>${buildIdentifier}</i> <b>${isStarted ? 'стартовала' : 'завершилась'}</b>
  ${link ? `<b>Ссылка: ${tryDecodeBase64(link)}</b>` : ''}
      `;
};
