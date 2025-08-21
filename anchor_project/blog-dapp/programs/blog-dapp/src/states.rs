use anchor_lang::prelude::*;

pub const CONTENT_LENGTH:usize=800; 
pub const COMMENT_LENGTH:usize=500; 
pub const TITLE_LENGTH:usize=30;
pub const BLOG_SEED:&str="BLOG_SEED";
pub const COMMENT_SEED:&str="COMMENT_SEED";
pub const REACTION_SEED:&str="REACTION_SEED";
pub const BOOKMARK_SEED:&str="BOOKMARK_SEED";

#[derive(Clone,InitSpace,AnchorDeserialize,AnchorSerialize)]
pub enum ReactionType{
   Like,
   DisLike
}

#[account]
#[derive(InitSpace)]
pub struct Blog{
   pub blog_author:Pubkey,
   #[max_len(TITLE_LENGTH)]
   pub title:String,
   #[max_len(CONTENT_LENGTH)]
   pub content:String,
   // pub content_uri:String,
   pub likes:u64,
   pub dislikes:u64,
   pub bookmarked:u64,
   pub bump:u8
}


#[account]
#[derive(InitSpace)]
pub struct Reaction {
   pub reaction_author:Pubkey,
   pub related_blog:Pubkey,
   pub reaction:ReactionType,
   pub bump:u8
}

#[account]
#[derive(InitSpace)]
pub struct Comment {
   pub comment_author:Pubkey,
   pub related_blog:Pubkey,
   #[max_len(COMMENT_LENGTH)]
   pub content:String,
   pub bump:u8
}

#[account]
#[derive(InitSpace)]
pub struct Bookmark{
    pub bookmark_author:Pubkey,
    pub related_blog:Pubkey,
    pub bump:u8
}


#[account]
#[derive(InitSpace)]
pub struct Tip{
   pub tip_author:Pubkey,
   pub related_blog:Pubkey,
   pub total_tip:u64,
   pub bump:u8,
}