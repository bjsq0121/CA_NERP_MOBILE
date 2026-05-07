# CA_NERP_MOBILE_TWO

## ERP DB 레퍼런스

@/mnt/c/Projects/CA_NERP/workspace/ERP_DB_DATA/CLAUDE.md

## Codex 작업 지시

- 이 프로젝트는 `/mnt/c/Projects/CA_NERP/workspace/CA_NERP2`와 연결된 모바일 프로젝트로 취급한다.
- `CA_NERP2` 백엔드 수정은 원칙적으로 `src/main/java/kr/co/ca/mobile/**` 패키지 안에서만 진행한다.
- `CA_NERP2`의 기존 웹 컨트롤러, 서비스, 매퍼, 도메인, 프로시저 호출 흐름은 특이 케이스가 아니면 수정하지 않고 재사용한다.
- `CA_NERP2`의 `mobile` 패키지는 모바일 호출을 기존 웹/ERP 기능으로 연결하는 얇은 중간 통로로 설계한다.
- 명령 실행 중 안전한 일반 확인 프롬프트가 나오면 사용자가 매번 입력하지 않도록 Codex가 알아서 `Y` 또는 `yes`로 진행한다.
- 권한 상승, 파괴적 명령, 외부 승인 UI처럼 사용자의 명시 승인이 필요한 작업은 이 규칙으로 우회하지 않는다.
