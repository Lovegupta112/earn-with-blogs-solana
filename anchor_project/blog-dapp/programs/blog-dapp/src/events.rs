use anchor_lang::prelude::*;

use crate::states::ReactionType;


#[event]
pub struct InitializeBlogEvent{
     pub blog_author:Pubkey,
     pub blog:Pubkey,
     pub title:String,
}
#[event]
pub struct RemoveBlogEvent{
     pub blog_author:Pubkey,
     pub blog:Pubkey,
     pub title:String
}
#[event]
pub struct EditBlogEvent{
     pub blog_author:Pubkey,
     pub blog:Pubkey,
     pub title:String
}
#[event]
pub struct BookmarkBlogEvent{
     pub bookmark_author:Pubkey,
     pub blog:Pubkey,
     pub title:String
}
#[event]
pub struct AddCommentEvent{
     pub comment_author:Pubkey,
     pub blog:Pubkey,
}
#[event]
pub struct RemoveCommentEvent{
     pub comment_author:Pubkey,
     pub blog:Pubkey,
}
#[event]
pub struct AddReactionEvent{
     pub reaction_author:Pubkey,
     pub blog:Pubkey,
     pub reaction_type:ReactionType
}
#[event]
pub struct RemoveReactionEvent{
     pub reaction_author:Pubkey,
     pub blog:Pubkey,
}


#[event]
pub struct TipEvent{
     pub blog_author:Pubkey,
     pub blog:Pubkey,
     pub title:String,
}