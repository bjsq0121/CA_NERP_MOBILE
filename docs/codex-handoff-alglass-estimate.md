# Codex Handoff: 모바일 샤시 알유리 견적 미표시 재분석

## 역할 원칙

- Hermes는 CA_NERP 코드 수정자가 아니다.
- Hermes는 분석/방향/검증/리뷰/프롬프트 작성만 담당한다.
- 실제 코드 수정은 Codex가 수행한다.
- 이 문서는 Codex가 수정 작업에 들어가기 전 읽을 핸드오프 문서다.

## 현재 사용자 증상

모바일 샤시 저장에서 `알유리견적`을 켜도 저장 후 알유리 견적이 보이지 않는다.

사용자 표현:

```text
그래도 알유리견적안나는데확인해
```

## 이번 재분석 결론

알유리 문제는 하나의 원인으로 단정하면 안 된다. Codex는 아래 3단계를 순서대로 증명해야 한다.

1. 모바일 저장 payload에 `glasStdalYn=Y`가 실제로 들어가는가?
2. 백엔드 저장 후 `stdalGlasEsti`가 실제 row를 생성하는가?
3. 생성된 알유리 row를 모바일 상세 조회/화면이 보여주는가?

현재 코드상 가장 의심되는 부분은 **3번: 모바일 상세 조회/표시 경로에서 알유리(P8)를 제외하거나 샤시 row로만 취급하는 문제**다. 하지만 Codex는 반드시 1, 2, 3을 로그/테스트/SQL 또는 코드 근거로 확인해야 한다.

## 확인된 코드 근거

### 1. 모바일 payload는 알유리 여부를 보낼 수 있음

파일:

```text
CA_NERP_MOBILE_TWO/src/utils/sashPayload.js
```

현재 payload builder는 아래 형태로 보낸다.

```js
glasStdalYn: form.alGlass ? 'Y' : 'N'
```

따라서 첫 번째 확인은 Network payload 또는 unit test로 `alGlass=true`일 때 `glasStdalYn=Y`가 실제 저장 API에 들어가는지 보는 것이다.

### 2. 모바일 백엔드 저장은 `stdalGlasEsti`를 호출하는 구조

파일:

```text
CA_NERP2/src/main/java/kr/co/ca/mobile/service/MobileEstiService.java
```

현재 저장 흐름은 대략 다음 구조다.

```java
itgEstiOneMapper.saveItgEstiProcCall(param);
itgEstiOneMapper.saveItgEstiProcCall2(param);
param.setCmpYn("N");
itgEstiOneMapper.updateEstiClWindCmpYn(param);

param.setGlasStdalYn(param.getGlasStdalYn() == null ? "N" : param.getGlasStdalYn());
if ("Y".equals(param.getGlasStdalYn())) {
    param.setErp2Save("Y");
    itgEstiOneMapper.stdalGlasEsti(param);
}
```

이 흐름은 레거시 웹 `ItgEstiOneService`의 샤시 저장 흐름과 유사하다.

레거시 웹 파일:

```text
CA_NERP2/src/main/java/kr/co/ca/service/ItgEstiOneService.java
```

웹도 `saveItgEstiProcCall`, `saveItgEstiProcCall2`, `updateEstiClWindCmpYn` 후 `glasStdalYn=Y`이면 `stdalGlasEsti`를 호출한다.

### 3. `stdalGlasEsti` 내부 생성 조건

파일:

```text
CA_NERP2/src/main/resources/mapper/ItgEstiOneMapper.xml
```

프로시저 ID:

```xml
<update id="stdalGlasEsti" statementType="CALLABLE" parameterType="EstiClWindInfo">
```

중요 조건:

```sql
SELECT CTGR2_CD INTO V_CTGR2_CD
FROM TWB_MDL_MST
WHERE MDL_CD = P_MDL_CD;

IF V_CTGR2_CD IN ('P2', 'P3', 'P4', 'P5') THEN
  ...
END IF;
```

즉 알유리 row 생성은 payload의 `ctgr2Cd` 자체보다 **`mdlCd`로 조회한 `TWB_MDL_MST.CTGR2_CD`가 P2/P3/P4/P5인지**에 의존한다.

또 실제 알유리 row insert cursor는 `TWE_ESTI_GLAS_MTRL_WNED_INFO`와 `TWE_ESTI_CL_WIND_INFO`를 아래 키로 조인한다.

```text
ITG_ESTI_NO
ESTI_NO
ESTI_NOS
ESTI_SEQ
```

따라서 `stdalGlasEsti` 호출 시점에 아래가 맞아야 한다.

- 샤시 row가 `TWE_ESTI_CL_WIND_INFO`에 저장되어 있어야 함
- 같은 키의 유리자재소요량 row가 `TWE_ESTI_GLAS_MTRL_WNED_INFO`에 생성되어 있어야 함
- `param.estiSeq`가 실제 저장 row의 seq와 같아야 함
- `mdlCd`의 `CTGR2_CD`가 P2/P3/P4/P5여야 함

### 4. 모바일 상세 조회는 `ItgEstiOneService.searchEstiAjax`를 재사용함

파일:

```text
CA_NERP2/src/main/java/kr/co/ca/service/ItgEstiOneService.java
```

`searchEstiAjax`는 필터에 따라 목록을 합친다.

```java
if (estiWindInfo.getEstiListFilterWind().equals("Y") || ...) {
    searchWindEstiList.addAll(itgEstiOneMapper.selectEstiListWindAndSbspmAndCb(estiWindInfo));
}
if (estiWindInfo.getEstiListFilterGlas().equals("Y")) {
    searchWindEstiList.addAll(itgEstiOneMapper.selectEstiListGlas(estiWindInfo));
}
```

즉 모바일 상세에서 알유리가 안 보이는 경우, 실제 row가 생성되었더라도 아래 조건이면 화면에 안 나온다.

- `estiListFilterGlas`가 `Y`가 아님
- `glasEstiNo`가 비어 있음
- `selectEstiListGlas` 결과가 프론트에서 샤시 row로 잘못 필터링됨
- 프론트가 P8/알유리 row를 표시할 섹션이 없음

## 특히 의심할 지점

### 의심 1: 저장은 됐지만 모바일 목록 조회에서 제외됨

모바일 `searchSashList`가 샤시 목록만 조회하려고 `estiListFilterWind=Y`, `estiListFilterGlas=N` 형태로 동작하면 알유리는 생성되어도 상세 화면에 나오지 않는다.

Codex는 `CA_NERP2/src/main/java/kr/co/ca/mobile/service/MobileEstiService.java`의 `searchSashList`를 확인하라.

확인할 것:

- `windEstiNo`를 어떻게 찾는가?
- `glasEstiNo`를 어떻게 찾는가?
- `EstiWindInfo`에 `setEstiListFilterGlas("Y")`가 필요한가?
- `setGlasEstiNo(...)`에 실제 알유리 견적번호가 들어가는가?
- `TWE_GLAS_ESTI_H`에서 해당 `itgEstiNo`의 `ESTI_NO`를 fallback으로 조회해야 하는가?

### 의심 2: 알유리 row 자체가 생성되지 않음

`stdalGlasEsti`가 호출되어도 row가 안 생길 수 있다.

확인할 것:

- `glasStdalYn=Y`가 백엔드 param에 들어오는가?
- `param.estiNo`, `param.estiNos`, `param.estiSeq`가 실제 저장 row와 같은가?
- `saveItgEstiProcCall2` 후 `TWE_ESTI_GLAS_MTRL_WNED_INFO`에 해당 row가 있는가?
- `TWB_MDL_MST.CTGR2_CD`가 P2/P3/P4/P5인가?
- `stdalGlasEsti` 내부에서 예외가 났는데 catch/log에 묻히는가?

### 의심 3: 프론트 화면이 알유리 row를 샤시 목록으로만 취급함

파일:

```text
CA_NERP_MOBILE_TWO/src/views/EstimateDetail.vue
```

모바일 상세 화면은 샤시 견적 목록 중심이다. 알유리(P8)는 샤시 수정 화면으로 열면 안 된다. Codex는 알유리 row를 별도 표시해야 하는지 확인하라.

권장 방향:

- API resultList에서 `ctgrCd === 'P8'` 또는 `ctgr2Cd === 'P8'` 또는 명칭이 알유리인 row를 분리
- 샤시 row는 기존 샤시 카드/수정 버튼 유지
- 알유리 row는 별도 “알유리 견적” 섹션에서 조회용 카드로 표시
- 알유리 row를 `SashNew` 수정 화면으로 보내지 말 것

## Codex 작업 전 주의사항

현재 작업트리에는 Hermes가 이전에 직접 건드린 변경이 섞여 있을 수 있다. Codex는 아래 파일의 현재 diff를 먼저 확인하고, 그대로 믿지 말고 필요한 경우 되돌린 뒤 재구현하라.

확인 대상:

```text
CA_NERP2/src/main/java/kr/co/ca/mobile/service/MobileEstiService.java
CA_NERP2/src/main/java/kr/co/ca/mapper/ItgEstiOneMapper.java
CA_NERP2/src/main/resources/mapper/ItgEstiOneMapper.xml
CA_NERP_MOBILE_TWO/src/views/EstimateDetail.vue
CA_NERP_MOBILE_TWO/src/views/SashNew.test.js
```

원칙:

- 기존 staged 샤시 parity 변경과 알유리 수정 변경을 섞지 말 것.
- 기존 staged 변경은 보존하되, 알유리 수정은 별도 diff로 설명 가능하게 유지할 것.
- 레거시 웹 서비스/프로시저 본체는 가능한 수정하지 말 것.
- 모바일 wrapper와 모바일 화면에서 해결 가능한지 먼저 확인할 것.

## Codex에게 줄 프롬프트

아래 프롬프트를 Codex에 그대로 전달한다.

```text
작업 목표:
모바일 샤시 저장에서 알유리견적을 체크해도 저장 후 알유리 견적이 보이지 않는 문제를 해결해줘.

중요 역할/범위:
- 실제 코드 수정은 Codex가 담당한다.
- Hermes가 남긴 docs/codex-handoff-alglass-estimate.md를 먼저 읽어라.
- Hermes가 이전에 직접 만진 diff가 있을 수 있으니 현재 diff를 맹신하지 말고 검토 후 필요한 경우 되돌리거나 재구현하라.
- 레거시 웹 서비스/프로시저 본체는 가능하면 수정하지 말고, 모바일 wrapper/API와 모바일 화면 표시 쪽에서 해결하라.
- 기존 샤시 parity staged 변경과 알유리 수정 변경이 섞이지 않게 diff를 명확히 유지하라.

관련 프로젝트 경로:
- 백엔드/레거시 웹: /mnt/c/Projects/CA_NERP/workspace/CA_NERP2
- 모바일: /mnt/c/Projects/CA_NERP/workspace/CA_NERP_MOBILE_TWO

먼저 확인할 파일:
- CA_NERP_MOBILE_TWO/docs/codex-handoff-alglass-estimate.md
- CA_NERP_MOBILE_TWO/src/utils/sashPayload.js
- CA_NERP_MOBILE_TWO/src/views/SashNew.vue
- CA_NERP_MOBILE_TWO/src/views/EstimateDetail.vue
- CA_NERP2/src/main/java/kr/co/ca/mobile/service/MobileEstiService.java
- CA_NERP2/src/main/java/kr/co/ca/service/ItgEstiOneService.java
- CA_NERP2/src/main/java/kr/co/ca/mapper/ItgEstiOneMapper.java
- CA_NERP2/src/main/resources/mapper/ItgEstiOneMapper.xml

분석 순서:
1. 모바일 저장 payload에서 `alGlass=true`일 때 `glasStdalYn=Y`가 실제 save API payload에 들어가는지 확인하라.
2. 백엔드 `MobileEstiService.saveSashEsti`에서 `glasStdalYn=Y`일 때 `stdalGlasEsti`가 호출되는지 확인하라.
3. `stdalGlasEsti`가 row를 생성하기 위한 조건을 확인하라.
   - `TWB_MDL_MST.CTGR2_CD`가 P2/P3/P4/P5인지
   - 저장된 샤시 row의 `ITG_ESTI_NO/ESTI_NO/ESTI_NOS/ESTI_SEQ`가 param과 일치하는지
   - `TWE_ESTI_GLAS_MTRL_WNED_INFO`에 같은 키의 row가 생성되어 있는지
   - `TWE_GLAS_ESTI_H`와 `TWE_ESTI_GLAS_STDAL_INFO`에 실제 row가 생기는지
4. row가 생성되는데 모바일 상세에서 안 보이면 `searchSashList` 조회 필터를 수정하라.
   - `ItgEstiOneService.searchEstiAjax`는 `estiListFilterGlas=Y`일 때 `selectEstiListGlas`를 호출한다.
   - 모바일 `searchSashList`에서 해당 `itgEstiNo`의 `glasEstiNo`를 찾아 `EstiWindInfo.setGlasEstiNo(...)`에 넣고, 알유리가 있으면 `setEstiListFilterGlas("Y")` 하라.
   - `selectItgEstiHeader`에 `gEstiNo`가 없다면 `TWE_GLAS_ESTI_H`에서 최신/사용 가능한 `ESTI_NO`를 조회하는 mobile-wrapper용 fallback mapper를 추가하라.
5. 프론트 `EstimateDetail.vue`에서 알유리 row를 샤시 row와 분리 표시하라.
   - `ctgrCd === 'P8'` 또는 `ctgr2Cd === 'P8'` 또는 이름이 알유리인 row를 별도 `glassRows`로 분리한다.
   - 샤시 목록에는 순수 샤시 row만 남긴다.
   - 알유리 row는 별도 “알유리 견적” 섹션에 조회용 카드로 표시한다.
   - 알유리 row를 샤시 수정 화면으로 열지 말라.
6. 만약 row 자체가 생성되지 않는다면 조회 표시를 고치기 전에 저장 side-effect부터 고쳐라.
   - `estiSeq`가 실제 저장 row와 일치하는지 확인
   - `saveItgEstiProcCall2` 후 `TWE_ESTI_GLAS_MTRL_WNED_INFO` 생성 여부 확인
   - `mdlCd`의 `CTGR2_CD` 확인
   - `stdalGlasEsti` 예외/errMsg 로그를 명확히 남겨라.

권장 SQL 확인 쿼리(가능할 때만 사용):
```sql
-- 저장된 샤시 row와 알유리 선택값 확인
SELECT ITG_ESTI_NO, ESTI_NO, ESTI_NOS, ESTI_SEQ, MDL_CD, GLAS_STDAL_YN, USE_YN
FROM TWE_ESTI_CL_WIND_INFO
WHERE ITG_ESTI_NO = :itgEstiNo
ORDER BY ESTI_NO, ESTI_NOS, ESTI_SEQ;

-- 모형 카테고리 확인
SELECT MDL_CD, CTGR2_CD
FROM TWB_MDL_MST
WHERE MDL_CD = :mdlCd;

-- 알유리 프로시저 cursor 입력 row 확인
SELECT COUNT(*) AS CNT
FROM TWE_ESTI_GLAS_MTRL_WNED_INFO
WHERE ITG_ESTI_NO = :itgEstiNo
  AND ESTI_NO = :windEstiNo
  AND ESTI_NOS = :estiNos
  AND ESTI_SEQ = :estiSeq;

-- 알유리 헤더 생성 확인
SELECT ITG_ESTI_NO, ESTI_NO, ESTI_NOS, ST_CD, USE_YN
FROM TWE_GLAS_ESTI_H
WHERE ITG_ESTI_NO = :itgEstiNo
ORDER BY ESTI_NO DESC;

-- 샤시에서 생성된 알유리 상세 row 확인
SELECT ITG_ESTI_NO, ESTI_NO, ESTI_NOS, ESTI_SEQ, EDESTI_NO, EDESTI_SEQ, CTGR_CD, CTGR2_CD, USE_YN
FROM TWE_ESTI_GLAS_STDAL_INFO
WHERE ITG_ESTI_NO = :itgEstiNo
ORDER BY ESTI_NO, ESTI_SEQ;
```

테스트 요구사항:
- 모바일 payload test: `alGlass=true`이면 `glasStdalYn=Y`.
- 백엔드 service/mapper test 또는 최소한 컴파일 확인: mobile `searchSashList`가 알유리 견적번호가 있을 때 `estiListFilterGlas=Y`, `glasEstiNo`를 세팅하는지.
- 프론트 test: `EstimateDetail.vue`가 P8/알유리 row를 샤시 row에서 분리하고 별도 섹션에 표시하는지.
- 기존 테스트 유지: `npm test`, `npm run build`.
- 백엔드 가능하면 `./gradlew compileJava` 또는 IDE compile. Hermes Docker에서는 JAVA_HOME이 없을 수 있으니 로컬/IntelliJ에서 확인하라.

최종 보고 형식:
1. 원인이 저장 payload 문제인지, 프로시저 생성 문제인지, 조회/표시 문제인지 명확히 분류
2. 수정한 파일 목록
3. 알유리 생성 확인 근거: 로그 또는 SQL 결과 또는 테스트 근거
4. 모바일 상세 표시 확인 근거
5. 실행한 검증 명령과 결과
6. 남은 수동 검증 항목
```

## 수동 검증 체크리스트

1. 상태 `10` 견적에서 모바일 샤시 신규 저장
2. 알유리 가능한 모형(P2/P3/P4/P5) 선택
3. `알유리견적` ON
4. 저장 payload에 `glasStdalYn=Y` 확인
5. 저장 후 DB 또는 로그에서 `stdalGlasEsti` 호출 확인
6. `TWE_GLAS_ESTI_H` 생성 확인
7. `TWE_ESTI_GLAS_STDAL_INFO` 생성 확인
8. 모바일 상세에서 샤시 견적과 알유리 견적이 모두 보이는지 확인
9. 알유리 row가 샤시 수정 화면으로 열리지 않는지 확인
10. 레거시 웹에서 동일 통합견적 조회 시 알유리 견적이 보이는지 확인

## Hermes 검토 의견

현재까지의 코드 근거만 보면 `glasStdalYn=Y` payload와 `stdalGlasEsti` 호출 구조는 존재한다. 따라서 우선순위는 다음이다.

1. 실제 저장 건에서 `TWE_GLAS_ESTI_H`, `TWE_ESTI_GLAS_STDAL_INFO`가 생겼는지 확인
2. 생겼다면 모바일 `searchSashList`의 `glasEstiNo`/`estiListFilterGlas` 조회 보정
3. 프론트 `EstimateDetail.vue`에서 P8/알유리 row 분리 표시
4. 안 생겼다면 `TWE_ESTI_GLAS_MTRL_WNED_INFO` 생성 여부와 `estiSeq` 불일치부터 확인
