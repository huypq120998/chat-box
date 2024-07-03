import { Container, Row, Col, Button } from "react-bootstrap"
import "react-tooltip/dist/react-tooltip.css"
import styles from "./Layout.module.css"
import banner from "../../assets/botgirl.svg"
import seeMore from "../../assets/seeMoreBlack.svg"
interface Props {
  onClickBtnExperience: () => void
  loadLawDocuments: () => void
}
import { userTheme } from "../../utils/userTheme"

export const BannerScreen = ({
  onClickBtnExperience,
  loadLawDocuments,
}: Props) => {
  return (
    <>
      <Container>
        <Row xs={1} lg={2}>
          <Col className={styles.rightBanner}>
            <div
              className={styles.headerBoxIntro}
              style={{ padding: "100px 20px 0 20px" }}
            >
              <span
                className={styles.iconStar}
                style={{ display: "inline-block", marginBottom: "1.5rem" }}
              ></span>
              <div className="mb-5">
                <span
                  className={styles.headerBoxIntroSub}
                  style={{ color: userTheme().color_bg }}
                >
                  {userTheme().banner_title}
                </span>
                <p
                  className={styles.headerBoxIntroTitle}
                  style={{ textAlign: "left", color: userTheme().color_text }}
                >
                  Huấn luyện với
                </p>
                <p
                  className={styles.headerBoxIntroTitle2}
                  style={{
                    textAlign: "left",
                    position: "relative",
                    color: userTheme().color_text,
                  }}
                >
                  Dữ liệu chuyên ngành
                  {/*<img onClick={loadLawDocuments} className={`${styles.headerNavPageLinkIcon} ${styles.iconLawtype}`} src={seeMore} alt=""/>*/}
                </p>
                <div className={styles.introTextgenDesk}>
                  {/* <p className={`${styles.introTextGen}`} style={{ marginTop: '6px' }}>Tương tác với Trợ lý ảo sử dụng công nghệ AI tiên tiến</p> */}
                  <p
                    className={`${styles.introTextGen}`}
                    style={{ marginTop: "6px" }}
                  >
                    Phiên bản thử nghiệm Beta
                  </p>
                </div>
                <div
                  className={styles.introTextGenMobile}
                  style={{ marginTop: "6px" }}
                >
                  {/* <p>Tương tác với Trợ lý ảo sử dụng công </p>
                                    <p>nghệ AI tiên tiến</p> */}
                  <p>Phiên bản thử nghiệm Beta</p>
                </div>
              </div>
              <div>
                <Button
                  className={`${styles.btnExperienceCustom}`}
                  onClick={onClickBtnExperience}
                  style={{
                    backgroundColor: userTheme().color_bg,
                    borderColor: userTheme().color_bg,
                  }}
                >
                  Trải nghiệm ngay
                </Button>
              </div>
            </div>
          </Col>
          <Col>
            <div
              className={styles.headerBoxIntro}
              style={{ textAlign: "center", padding: "100px 30px 0 30px" }}
            >
              <img
                src={userTheme().botgirl}
                className={`${styles.zoomIn} ${styles.imgBanner}`}
              />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  )
}
