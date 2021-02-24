# Maven Dependency Downloader (in Javascript)

소프트웨어를 설치할 수 없는 환경에서 브라우저를 이용해 메이븐 리포지토리의 라이브러리를 다운받기 위한 자바스크립트 파일입니다.

# 구현된 것
라이브러리 groupId, artifactId, version을 지정하고 브라우저 개발자 도구에서 두 번 실행하면 의존하고 있는 모든 라이브러리의 .jar, .pom을 다운로드합니다.

# TODO
- 메이븐의 의존성 탐색 로직 그대로 구현
  - exclusion 명시된 의존성 가져오지 않기
  - 프로퍼티 읽어와서 대입하기
  - scope별 다운로드 정책 설정할 수 있게 하기 (ex: test, provided는 다운받지 않기)
  - 부모 pom 상속 구현
- zip 파일로 묶어서 다운로드
- 다운로드 딜레이 설정
- 의존성 트리 예쁘게 만들기