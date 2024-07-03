import logo_viettel from "../assets/viettel/logo.png"
import logo_mimi_viettel from "../assets/viettel/ic_mimi_white.png"
import logo_mimi_gray_viettel from "../assets/viettel/ic_mimi_gray.png"
import layout_bg_viettel from "../assets/viettel/tlacc_home3.svg"
import chat_main_viettel from "../assets/viettel/chatMainRed.svg"
import chat_main_no_header_viettel from "../assets/viettel/chatMainWhite.svg"
import thu_nghiem_viettel from "../assets/viettel/thunghiemred.svg"
import thu_nghiem_no_header_viettel from "../assets/viettel/thunghiemWhite.svg"
import header_main_viettel from "../assets/viettel/header_main_chat.svg"
import botgirl_viettel from "../assets/viettel/botgirl.svg"
import star_viettel from "../assets/viettel/icon-star.svg"
import addchat_viettel from "../assets/viettel/addchat.svg"
import sendred_viettel from "../assets/viettel/send_red.svg"
import ic_like_active_viettel from "../assets/viettel/ic_like_active.svg"
import ic_dislike_active_viettel from "../assets/viettel/ic_dislike_active.svg"

import logo_vnpost from "../assets/vnpost/logo.png"
import logo_mimi_vnpost from "../assets/vnpost/logo_white.svg"
import logo_mimi_gray_vnpost from "../assets/vnpost/ic_mimi_gray.png"
import layout_bg_vnpost from "../assets/vnpost/tlacc_home3.svg"
import chat_main_vnpost from "../assets/vnpost/chatMainRed.svg"
import chat_main_no_header_vnpost from "../assets/vnpost/chatMainWhite.svg"
import thu_nghiem_vnpost from "../assets/vnpost/thunghiemred.svg"
import thu_nghiem_no_header_vnpost from "../assets/vnpost/thunghiemWhite.svg"
import header_main_vnpost from "../assets/vnpost/header_main_chat.svg"
import botgirl_vnpost from "../assets/vnpost/botgirl.svg"
import star_vnpost from "../assets/vnpost/icon-star.svg"
import addchat_vnpost from "../assets/vnpost/addchat.svg"
import sendred_vnpost from "../assets/vnpost/send_red.svg"
import ic_like_active_vnpost from "../assets/vnpost/ic_like_active.svg"
import ic_dislike_active_vnpost from "../assets/vnpost/ic_dislike_active.svg"

export const userTheme = () => {
  const userLocal = JSON.parse(localStorage.getItem("_user") || "{}")
  const enterpriseName = userLocal?.enterpriseName?.toLowerCase()
  let theme: any = {}
  switch (enterpriseName) {
    case "vietnam post":
      theme = {
        color_text_no_header: "#fff",
        color_text: "#004b8e",
        color_bg: "#e69a07",
        color_citation_text: "#004b8e",
        color_citation_bg: "#e6edf4",
        logo: logo_vnpost,
        logo_mimi: logo_mimi_vnpost,
        logo_mimi_gray: logo_mimi_gray_vnpost,
        layout_title: "TRỢ LÝ ẢO VIETNAM POST",
        layout_bg: layout_bg_vnpost,
        chat_main: chat_main_vnpost,
        chat_main_no_header: chat_main_no_header_vnpost,
        thu_nghiem: thu_nghiem_vnpost,
        thu_nghiem_no_header: thu_nghiem_no_header_vnpost,
        header_main: header_main_vnpost,
        banner_title: "Vietnam Post",
        botgirl: botgirl_vnpost,
        star: star_vnpost,
        addchat: addchat_vnpost,
        sendred: sendred_vnpost,
        favicon: "./logo/vnpost.png",
        ic_like_active: ic_like_active_vnpost,
        ic_dislike_active: ic_dislike_active_vnpost,
      }
      break
    default:
      theme = {
        color_text_no_header: "#fff",
        color_text: "#000",
        color_citation_text: "#ee004f",
        color_citation_bg: "#ffeff2",
        color_bg: "#ee0033",
        logo: logo_viettel,
        logo_mimi: logo_mimi_viettel,
        logo_mimi_gray: logo_mimi_gray_viettel,
        layout_title: "TRỢ LÝ ẢO",
        layout_bg: layout_bg_viettel,
        chat_main: chat_main_viettel,
        chat_main_no_header: chat_main_no_header_viettel,
        thu_nghiem: thu_nghiem_viettel,
        thu_nghiem_no_header: thu_nghiem_no_header_viettel,
        header_main: header_main_viettel,
        banner_title: "",
        botgirl: botgirl_viettel,
        star: star_viettel,
        addchat: addchat_viettel,
        sendred: sendred_viettel,
        favicon: "./logo/viettel.png",
        ic_like_active: ic_like_active_viettel,
        ic_dislike_active: ic_dislike_active_viettel,
      }
      break
  }

  return theme
}
