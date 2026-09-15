# 학교탈출 — 감시자의 밤

2026년 9월 14일 스토리 업데이트 버전의 GitHub 업로드용 파일입니다.
직접 이동하는 3D 게임, 세 난이도, 동료, 퍼즐, 전투, 두 엔딩과 세 장의 일러스트가 포함되어 있습니다.

## GitHub에 올리기

1. ZIP을 내려받아 압축을 풉니다.
2. https://github.com/ddargi0410/emerlvudrk 에서 `main` 브랜치를 엽니다.
3. `Add file → Upload files`를 누릅니다.
4. 압축을 푼 폴더 **안의 모든 파일과 폴더**를 업로드 영역으로 드래그합니다. ZIP 자체나 바깥 폴더를 올리지 마세요. `index.html`이 저장소 첫 화면에 놓여야 합니다. `art`, `fonts`, `vendor` 폴더도 함께 올리세요.
5. 변경 내용을 `학교탈출 2026-09-14 스토리 업데이트`로 적고 `main` 브랜치에 저장합니다(`Commit changes`).
6. `Settings → Pages`에서 `Deploy from a branch`, `main`, `/(root)`를 선택하고 저장합니다. 이미 같은 설정이면 그대로 두면 됩니다.
7. 배포가 끝나면 https://ddargi0410.github.io/emerlvudrk/ 를 열어 확인합니다. 이전 화면이 보이면 `Ctrl + F5`로 새로고침하세요.

공식 안내: [파일 업로드](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository), [Pages 설정](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## 실행할 때

별도 빌드나 npm 설치 없이 GitHub Pages에서 실행됩니다. `index.html`을 컴퓨터에서 더블클릭하면 브라우저의 모듈 보안 제한으로 실행되지 않을 수 있으므로, 업로드 후 위 게임 주소를 이용하세요.
PC의 Chrome 또는 Edge를 권장합니다. 휴대전화에는 화면 조작 버튼이 표시됩니다. 첫 클릭 이후 소리가 활성화됩니다.

저장 기록은 플레이한 브라우저와 사이트 주소별로 보관됩니다. 기존 ChatGPT 게임 주소의 진행 기록은 GitHub 주소로 자동 이전되지 않습니다.

## 기본 조작

| 키 | 행동 |
| --- | --- |
| W A S D | 이동 |
| 마우스 / ← → | 시선 회전 |
| E | 조사·문 열기·대화 |
| Space | 점프 |
| Shift | 달리기 |
| Q | 공격 |
| 0 | 1인칭·3인칭 전환 |
| F | 손전등 |
| J / H | 가방·기록·제작 / 힌트 |
| Esc / P | 일시정지 |

교문 암호: **4444**

## 포함된 원본과 조정 사항

원본 저장 시각: 2026-09-14 12:07:34 (한국시간)
원본 버전: 2.0.0
원본 커밋: `3821816d05e5bb19d2fcedb6d1753704ab5c959d`

게임 로직과 일러스트는 이 버전을 사용합니다. GitHub의 저장소 하위 주소에서도 열리도록 홈페이지·CSS·스크립트·일러스트 경로를 상대 경로로 조정했습니다.
한 번의 웹 업로드에 들어가도록 124개의 글꼴 파일을 `fonts/font.css` 안에 원래 바이트 그대로 포함했습니다. 글꼴 디자인은 변경하지 않았습니다.
게임 JavaScript 소스와 모든 실행 자산이 포함되어 있습니다.

Three.js 라이선스는 `vendor/THREE-LICENSE`, Noto Sans KR 글꼴 라이선스는 `fonts/LICENSE`에 있습니다.
