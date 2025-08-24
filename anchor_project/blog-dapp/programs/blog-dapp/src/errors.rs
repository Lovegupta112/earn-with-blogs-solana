use anchor_lang::prelude::*;


#[error_code]
pub enum BlogError{
 #[msg("Cannot initialize, content too long")]
 ContentTooLong,
 #[msg("Cannot initialize, title too long")]
 TitleTooLong,
  #[msg("Minimum number of Likes Reached")]
 MinLikesReached,
  #[msg("Maximum number of Likes Reached")]
 MaxLikesReached,
  #[msg("Minimum number of Dislikes Reached")]
 MinDislikesReached,
  #[msg("Maximum number of Dislikes Reached")]
 MaxDislikesReached,
  #[msg("Minimum number of Bookmark Reached")]
 MinBookmarkReached,
  #[msg("Maximum number of Bookmark Reached")]
 MaxBookmarkReached,
  #[msg("Maximum number of Blog tip Reached")]
 MaxBlogTipReached,
 #[msg("Comment too Long")]
 CommentTooLong,
 #[msg("Can not tip own blog")]
 CannotTipOwnBlog
}