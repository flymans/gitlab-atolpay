const PROJECT_LIST = {
  fisht: 1343,
  layla: 1626,
  sugan: 1731,
};
type ProjectName = keyof typeof PROJECT_LIST;

const GROUP_LIST = {
  clientScope: 1662,
  secScope: 1703,
  fisc: 1660,
};

export { PROJECT_LIST, GROUP_LIST };
export { ProjectName };
