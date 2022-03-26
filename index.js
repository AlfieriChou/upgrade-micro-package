const {
  MULTI_SERVER = '[]',
  TARGET_DIR = '',
  TARGET_BRANCH = 'chore/upgrade',
  INSTALL_TOOL = 'yarn',
  PACKAGE_NAME,
  PACKAGE_VERSION
} = process.env

const upgradePackage = async (projectPath) => {
  shell.cd(projectPath)
  const currentBranchInfo = shell.exec('git symbolic-ref --short -q HEAD')
  const currentBranch = currentBranchInfo.stdout.toString().replace(/\s+/g, '')
  if (currentBranch !== TARGET_BRANCH) {
    shell.exec('git checkout develop')
    shell.exec(`git checkout -b ${TARGET_BRANCH}`)
  }
  if (INSTALL_TOOL === 'yarn') {
    shell.exec(`yarn install ${PACKAGE_NAME}${PACKAGE_VERSION ? '' : '@' + PACKAGE_VERSION}`)
    shell.exec('git add package.json yarn.lock')
    if (PACKAGE_VERSION) {
      shell.exec(`git commit -m "chore: upgrade ${PACKAGE_NAME} ${PACKAGE_VERSION}"`)
    } else {
      shell.exec(`git commit -m "chore: upgrade ${PACKAGE_NAME}"`)
    }
    shell.exec(`git push origin ${TARGET_BRANCH}`)
  }
}

module.exports = async () => {
  await JSON.parse(MULTI_SERVER || '[]').reduce(async (promise, serverName) => {
    await promise
    try {
      await upgradePackage(`${TARGET_DIR}${serverName}`)
    } catch (err) {
      console.error('处理异常', err)
    }
  }, Promise.resolve())
}
