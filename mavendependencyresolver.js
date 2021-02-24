
/**
 * STEP1. 다음 객체를 수정해 다운받을 라이브러리를 설정할 것
 */

let LIBRARY_I_WANT_TO_DOWNLOAD = {
  groupId: "httpunit",
  artifactId: "httpunit",
  version: "1.6"
}

let IS_PSEUDO_DOWNLOAD = false; //의존성만 확인하려면 true, 실제로 파일을 다운받으려면 false로 설정


/**
 * STEP2. 코드 전체를 복붙해서 실행할 것 (메이븐 저장소로 이동함)
 * 크롬 개발자 도구의 Sources > Snippets 을 활용하는 것을 권장
 * 
 * 
 * STEP3. 이동한 위치에서 다시 실행할 것
 */

let libraryCacheMap = new Map();

async function main() {
    repoUrl = getUrl(LIBRARY_I_WANT_TO_DOWNLOAD)
    if (location.href !== getUrl(LIBRARY_I_WANT_TO_DOWNLOAD) + '/') {
        location.href = repoUrl;
    }
    else {
        await downloadJarWithDependency(LIBRARY_I_WANT_TO_DOWNLOAD, 0);
    }
}

main();

/////////////////////////////////// functions ////////////////////////////////

function getUrl(library) {
    return makeRepoUrl(library);
}

function printLogWithDepth(msg, searchDepth) {
    space = "";
    for (i = 0; i < searchDepth; i++)
        space += "    ";
    console.log(space + msg);
}

async function downloadJarWithDependency(library, searchDepth) {
    printLogWithDepth(`${makeLibraryName(library)} 다운로드: ${makeRepoUrl(library)}`, searchDepth);
    libraryCacheMap.set(makeLibraryName(library), null);
    downloadFile(makeDownloadUrl(library, 'jar'), makeFileName(library, 'jar'));
    downloadFile(makeDownloadUrl(library, 'pom'), makeFileName(library, 'pom'));
    pomXmlUrl = makeDownloadUrl(library, 'pom');
    await downloadDependencyRecursively(pomXmlUrl, searchDepth);
}

function makeDownloadUrl(library, extension) {
    return `${makeRepoUrl(library)}/${makeFileName(library, extension)}`;
}

function makeRepoUrl(library) {
    const BASE_URL = 'https://repo1.maven.org/maven2/';
    const groupIdUrl = library.groupId.replace(/\./gi, '/');
    return `${BASE_URL}${groupIdUrl}/${library.artifactId}/${library.version}`;
}

function makeFileName(library, extension) {
    const fileName = `${library.artifactId}-${library.version}.${extension}`;
    return fileName;
}

function downloadFile(fileUrl, fileName) {
  if (IS_PSEUDO_DOWNLOAD)
    return;
  const a = document.createElement('a');
  a.setAttribute("download", fileName);
  a.setAttribute("href", fileUrl);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

async function downloadDependencyRecursively(pomXmlUrl, searchDepth) {
    const response = await fetch(pomXmlUrl);
    const pomXml = await response.text();
    await dfsDependencies(pomXml, searchDepth);
}

async function dfsDependencies(pomXml, searchDepth) {
    searchDepth += 1;
    const parser = new DOMParser();
    const dom = parser.parseFromString(pomXml, "text/xml");
    const dependencies = dom.getElementsByTagName("dependency");
    for (let i = 0; i < dependencies.length; i++) {
        const dependency = dependencies[i];
        nextLibrary = {
            "groupId": getDependencyProperty(dependency, "groupId"),
            "artifactId": getDependencyProperty(dependency, "artifactId"),
            "version": getDependencyProperty(dependency, "version")
        }
        if (isCachedLibrary(nextLibrary)) {
            printLogWithDepth(`${makeLibraryName(nextLibrary)} 의존성은 이미 다운로드됨. 탐색을 중단함.`, searchDepth)
            continue;
        }
        await downloadJarWithDependency(nextLibrary, searchDepth);
    }

    function getDependencyProperty(dependency, propertyName) {
        try {
            return dependency.getElementsByTagName(propertyName)[0].innerHTML;
        }
        catch (err) {
            printLogWithDepth(`${err}`, searchDepth);
            if (propertyName == "version") {
                printLogWithDepth(`${getDependencyProperty(dependency, "artifactId")}의 버전이 명시되지 않음.`, searchDepth);
                //TODO: 최신 버전 다운?
            }
            else {
                printLogWithDepth(`${getDependencyProperty(dependency, "artifactId")}}의 에러. 프로퍼티 이름: ${propertyName}`, searchDepth)
            }
        }
    }

    function isCachedLibrary(library) {
        if (libraryCacheMap.has(makeLibraryName(library)))
            return true;
        return false;
    }
}

function makeLibraryName(library) {
    return `${library.groupId}/${library.artifactId}/${library.version}`;
}