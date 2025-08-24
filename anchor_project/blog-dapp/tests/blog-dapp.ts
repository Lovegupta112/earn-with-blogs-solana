import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BlogDapp } from "../target/types/blog_dapp";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { assert } from "chai";
import crypto from 'crypto';
import  BN  from "bn.js";

describe("blog-dapp", () => {
  // Configure the client to use the local cluster.
  const provider=anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  

  const program = anchor.workspace.blogDapp as Program<BlogDapp>;
  const programId=program.programId;
  
  const bob=anchor.web3.Keypair.generate();
  const alice=anchor.web3.Keypair.generate();
  const john=anchor.web3.Keypair.generate();

  //blog testing ------>>
    
    //add blog --- 
    const blog_title_bob1="Intro to react";
    const blog_content_bob1="react is fronend ui library zz zz zz zz zz zz zzz zzz zz that provides reusable components.";
    
    const empty_title="empty blog content";
    const empty_content="";

    const unicode_title="best title 🎉";
    const unicode_content="best content ever 🔥";

    const title_more_than_30_bytes = "A".repeat(32);
    const blog_content_bob2="this blog content related to test that should fail to initialized blog when title exceeds 30 bytes";
    
    const blog_title_bob3="content more than 800 bytes";
    const blog_content_more_than_800_bytes="content".repeat(116);

    const blog_title_bob4="different topic with same user";
    const blog_content_bob4="this blog content related to test that should initialize blog with differnt topic and same author";

    //update blog---
    const blog_updated_content_bob1="This is updated content of react by bob. React is fronend ui library zz zz zz zz zz zz zzz zzz zz that provides reusable components.";
    const blog_updated_content_alice1="This is updated content of react by alice. React is fronend ui library zz zz zz zz zz zz zzz zzz zz that provides reusable components.";
    
    //comment : ------
     const blog_comment_bob1="this was superb content.";
     const blog_comment_john1="great blog and i learnt a lot. ";
     const comment_content_more_than_400_bytes="comment".repeat(60);

    // tip: -----
    const blog_tip_john1=new BN(0.2 * LAMPORTS_PER_SOL);
    const blog_tip_bob1=new BN(0.3 * LAMPORTS_PER_SOL);


    describe("add blog",async ()=>{

        it("should initialize blog with valid title and content", async () => {
          await requestAirdrop(provider.connection,bob.publicKey);
          const [blog_pkey,blog_bump]= getBlogAddress(blog_title_bob1,bob.publicKey,programId);
          await program.methods.addBlog(blog_title_bob1,blog_content_bob1)
            .accounts({
              blogAuthor:bob.publicKey,
              blog:blog_pkey,
              system_program:anchor.web3.SystemProgram.programId
            }).signers([bob]).rpc({commitment:"confirmed"});

          await checkBlog(program,blog_pkey,bob.publicKey,blog_title_bob1,blog_content_bob1,0,0,blog_bump);

        }) 
        it("should initialize blog with empty content", async () => {
            const [blog_pkey,blog_bump]= getBlogAddress(empty_title,bob.publicKey,programId);

            await program.methods.addBlog(empty_title,empty_content)
              .accounts({
                blogAuthor:bob.publicKey,
                blog:blog_pkey,
                system_program:anchor.web3.SystemProgram.programId
              }).signers([bob]).rpc({commitment:"confirmed"});

          
              await checkBlog(program,blog_pkey,bob.publicKey,empty_title,empty_content,0,0,blog_bump);

        })
        it("should initialize blog  with unicode character with emojis", async () => {
          // Add your test here.
              const [blog_pkey,blog_bump]= getBlogAddress(unicode_title,bob.publicKey,programId);


            await program.methods.addBlog(unicode_title,unicode_content)
              .accounts({
                blogAuthor:bob.publicKey,
                blog:blog_pkey,
                system_program:anchor.web3.SystemProgram.programId
              }).signers([bob]).rpc({commitment:"confirmed"});

          
              await checkBlog(program,blog_pkey,bob.publicKey,unicode_title,unicode_content,0,0,blog_bump);

        })
        it("should fail to initialize blog when title exceeds 30 bytes", async () => {
            const [blog_pkey]= getBlogAddress(title_more_than_30_bytes,bob.publicKey,programId);

            try{
              await program.methods.addBlog(title_more_than_30_bytes,blog_content_bob2)
              .accounts({
                blogAuthor:bob.publicKey,
                blog:blog_pkey,
                system_program:anchor.web3.SystemProgram.programId
            }).signers([bob]).rpc({commitment:"confirmed"});
            }
            catch(err){
            const error=anchor.AnchorError.parse(err.logs)
            const errorCode=error.error.errorCode.code;
              assert.strictEqual(errorCode,"TitleTooLong","TitleTooLong Error if title exceeds 30 bytes");
            }
          
        })
        it("should fail to initialize blog when content exceeds 800 bytes", async () => {
            const [blog_pkey]= getBlogAddress(blog_title_bob3,bob.publicKey,programId);

            try{
                await program.methods.addBlog(blog_title_bob3,blog_content_more_than_800_bytes)
                .accounts({
                  blogAuthor:bob.publicKey,
                  blog:blog_pkey,
                  system_program:anchor.web3.SystemProgram.programId
                }).signers([bob]).rpc({commitment:"confirmed"});
            }
            catch(err){
              const error=anchor.AnchorError.parse(err.logs)
              const errorCode=error.error.errorCode.code;
              assert.strictEqual(errorCode,"ContentTooLong","ContentTooLong Error if title exceeds 800 bytes");
            }
          
        })
        it("should fail to initialize duplicate blog with same title and author",async()=>{
            const [blog_pkey]= getBlogAddress(blog_title_bob1,bob.publicKey,programId);
            let failed=false;
            try{
              await program.methods.addBlog(blog_title_bob1,blog_content_bob1)
              .accounts({
                blogAuthor:bob.publicKey,
                blog:blog_pkey,
                system_program:anchor.web3.SystemProgram.programId
            }).signers([bob]).rpc({commitment:"confirmed"});
            }
            catch(err){
               
              failed=err.logs.some((log)=>log.includes('already in use'));
              assert.strictEqual(failed,true,"Transaction should have failed")
            }
        })
        it("should initialize blog with differnt title and same author",async()=>{
            const [blog_pkey,blog_bump]= getBlogAddress(blog_title_bob4,bob.publicKey,programId);

              await program.methods.addBlog(blog_title_bob4,blog_content_bob4)
              .accounts({
                blogAuthor:bob.publicKey,
                blog:blog_pkey,
                system_program:anchor.web3.SystemProgram.programId
            }).signers([bob]).rpc({commitment:"confirmed"});
            
          await checkBlog(program,blog_pkey,bob.publicKey,blog_title_bob4,blog_content_bob4,0,0,blog_bump);

        })
        it("should initialize blog with same title and different author",async()=>{
           await requestAirdrop(provider.connection,alice.publicKey);
            const [blog_pkey,blog_bump]= getBlogAddress(blog_title_bob1,alice.publicKey,programId);

              await program.methods.addBlog(blog_title_bob1,blog_content_bob1)
              .accounts({
                blogAuthor:alice.publicKey,
                blog:blog_pkey,
                system_program:anchor.web3.SystemProgram.programId
            }).signers([alice]).rpc({commitment:"confirmed"});
           
          await checkBlog(program,blog_pkey,alice.publicKey,blog_title_bob1,blog_content_bob1,0,0,blog_bump);

        })
    })
    describe("update blog",async()=>{
       it("should allow blog author to update his/her blog ",async ()=>{
         const [blog_pkey,blog_bump]=getBlogAddress(blog_title_bob1,bob.publicKey,programId);

          await program.methods.updateBlog(blog_updated_content_bob1)
          .accounts({
            blogAuthor:bob.publicKey,
            blog:blog_pkey
          }).signers([bob]).rpc({commitment:"confirmed"});

          await checkBlog(program,blog_pkey,bob.publicKey,blog_title_bob1,blog_updated_content_bob1,0,0,blog_bump);
       })
       it("should not allow others to update other's blog ",async ()=>{
         const [blog_pkey]=getBlogAddress(blog_title_bob1,bob.publicKey,programId);
          let failed=false;
          try{
           await program.methods.updateBlog(blog_updated_content_alice1)
          .accounts({
            blogAuthor:bob.publicKey,
            blog:blog_pkey
          }).signers([alice]).rpc({commitment:"confirmed"});
          }
          catch(err){
           failed=true;
           assert.strictEqual(failed,true,"Transaction should have failed");
          }

       })
       it("should not allow to add more than 800 bytes",async ()=>{
          const [blog_pkey]= getBlogAddress(blog_title_bob1,bob.publicKey,programId);

            try{
                await program.methods.updateBlog(blog_content_more_than_800_bytes)
                .accounts({
                  blogAuthor:bob.publicKey,
                  blog:blog_pkey,
                }).signers([bob]).rpc({commitment:"confirmed"});
            }
            catch(err){
              const error=anchor.AnchorError.parse(err.logs)
              const errorCode=error.error.errorCode.code;
              assert.strictEqual(errorCode,"ContentTooLong","ContentTooLong Error if title exceeds 800 bytes");
            }
       })
    });
    describe("Save/Bookmarked Blog",async()=>{
      
      it("should allow blog authors to bookmark their own blog ",async ()=>{
         const [blog_pkey,blog_bump]=getBlogAddress(blog_title_bob1,bob.publicKey,programId);
         const [bookmark_pkey,bookmark_bump]=getBookmarkAddress(bob.publicKey,blog_pkey,programId);

         await program.methods.saveBlog()
         .accounts({
          bookmarkAuthor:bob.publicKey,
          bookmark:bookmark_pkey,
          blog:blog_pkey,
          system_program:anchor.web3.SystemProgram.programId
         }).signers([bob]).rpc({commitment:"confirmed"});


        checkBookmark(program,bookmark_pkey,bob.publicKey,blog_pkey,bookmark_bump);
        checkBlog(program,blog_pkey,bob.publicKey,blog_title_bob1,blog_content_bob1,0,0,blog_bump,1);
      })
      it("should allow others to bookmark other's blog",async ()=>{
         await requestAirdrop(provider.connection,alice.publicKey);
         const [blog_pkey,blog_bump]=getBlogAddress(blog_title_bob1,bob.publicKey,programId);
         const [bookmark_pkey,bookmark_bump]=getBookmarkAddress(alice.publicKey,blog_pkey,programId);

         await program.methods.saveBlog()
         .accounts({
          bookmarkAuthor:alice.publicKey,
          bookmark:bookmark_pkey,
          blog:blog_pkey,
          system_program:anchor.web3.SystemProgram.programId
         }).signers([alice]).rpc({commitment:"confirmed"});


        checkBookmark(program,bookmark_pkey,alice.publicKey,blog_pkey,bookmark_bump);
        checkBlog(program,blog_pkey,bob.publicKey,blog_title_bob1,blog_content_bob1,0,0,blog_bump,2);
      })
      it("should fail to bookmark same blog twice",async ()=>{
         const [blog_pkey]=getBlogAddress(blog_title_bob1,bob.publicKey,programId);
         const [bookmark_pkey,bookmark_bump]=getBookmarkAddress(bob.publicKey,blog_pkey,programId);
        let failed=false;
         try{
           await program.methods.saveBlog()
            .accounts({
              bookmarkAuthor:bob.publicKey,
              bookmark:bookmark_pkey,
              blog:blog_pkey,
              system_program:anchor.web3.SystemProgram.programId
            }).signers([bob]).rpc({commitment:"confirmed"});

         }
         catch(err){
            failed=err.logs.some((log)=>log.includes('already in use'));
            assert.strictEqual(failed,true,"Transaction should have failed")
         }
        checkBookmark(program,bookmark_pkey,bob.publicKey,blog_pkey,bookmark_bump);
      })
    });
    describe("Remove bookmarked Blog",async()=>{
        it("should allow blog authors  to remove their own bookmark",async ()=>{
          const [blog_pkey,blog_bump]=getBlogAddress(blog_title_bob1,bob.publicKey,programId);
          const [bookmark_pkey]=getBookmarkAddress(bob.publicKey,blog_pkey,programId);

          await program.methods.unsaveBlog()
          .accounts({
            bookmarkAuthor:bob.publicKey,
            bookmark:bookmark_pkey,
            blog:blog_pkey
          }).signers([bob]).rpc({commitment:"confirmed"});
          
          let failed=false;
          try{
              await program.account.bookmark.fetch(bookmark_pkey);
          }
          catch(err){
            failed=err?.message.includes("Account does not exist");
            assert.strictEqual(failed,true,"Transaction should have failed")
            checkBlog(program,blog_pkey,bob.publicKey,blog_title_bob1,blog_content_bob1,0,0,blog_bump,1)
          }
          
        })
        it("should not allow others to remove other's bookmark",async ()=>{
          await requestAirdrop(provider.connection,alice.publicKey);
          const [blog_pkey]=getBlogAddress(blog_title_bob1,bob.publicKey,programId);
          const [bookmark_pkey]=getBookmarkAddress(bob.publicKey,blog_pkey,programId);

          let failed=false;
          try{
              await program.methods.unsaveBlog()
              .accounts({
                bookmarkAuthor:bob.publicKey,
                bookmark:bookmark_pkey,
                blog:blog_pkey
              }).signers([alice]).rpc({commitment:"confirmed"});
          }
          catch(err){
            failed=err?.message?.includes("unknown signer");
              assert.strictEqual(failed,true,"Transaction should have failed");
          }
          
        })
        it("should not allow to remove non-existent bookmark",async ()=>{
          const [blog_pkey]=getBlogAddress(blog_title_bob1,bob.publicKey,programId);
          const [bookmark_pkey]=getBookmarkAddress(bob.publicKey,blog_pkey,programId);

          try{
              await program.methods.unsaveBlog()
              .accounts({
                bookmarkAuthor:bob.publicKey,
                bookmark:bookmark_pkey,
                blog:blog_pkey
              }).signers([bob]).rpc({commitment:"confirmed"});
          }
          catch(err){
            const error=anchor.AnchorError.parse(err.logs)
            const errorCode=error.error.errorCode.code;
              assert.strictEqual(errorCode,"AccountNotInitialized","AccountNotInitialized Error: bookmark doesn't exist");
          }
          
        })
    });

    describe("Add Tip to Blog",async()=>{
       
        it("should allow users to give tip for blog",async()=>{
          await requestAirdrop(provider.connection,john.publicKey);
          await requestAirdrop(provider.connection,bob.publicKey);
          const [blog_pkey]=getBlogAddress(blog_title_bob1,bob.publicKey,programId);
          const [tip_pkey,tip_bump]=getTipAddress(john.publicKey,blog_pkey,programId);

              await program.methods.tipForBlog(blog_tip_john1)
              .accounts({
                tipAuthor:john.publicKey,
                tip:tip_pkey,
                blog:blog_pkey,
                system_program:anchor.web3.SystemProgram.programId
              }).signers([john]).rpc({commitment:"confirmed"}); 
        
          checkTip(program,tip_pkey,john.publicKey,blog_pkey,blog_tip_john1,tip_bump);
        })
        it("should not allow blog authors to give tip for their blog",async()=>{
          const [blog_pkey]=getBlogAddress(blog_title_bob1,bob.publicKey,programId);
          const [tip_pkey]=getTipAddress(bob.publicKey,blog_pkey,programId);


          try{
            await program.methods.tipForBlog(blog_tip_bob1)
            .accounts({
              tipAuthor:bob.publicKey,
              tip:tip_pkey,
              blog:blog_pkey,
              system_program:anchor.web3.SystemProgram.programId
            }).signers([bob]).rpc({commitment:"confirmed"});
          }
          catch(err){
            const error=anchor.AnchorError.parse(err.logs)
          const errorCode=error.error.errorCode.code;
            assert.strictEqual(errorCode,"CannotTipOwnBlog","CannotTipOwnBlog Error: Blog authors can't give tip to their blogs!");
          }
          
        })
        it("should fail to give tip for non-existent blog",async()=>{
          const [blog_pkey]=getBlogAddress("non-existent blog",bob.publicKey,programId);
          const [tip_pkey,tip_bump]=getTipAddress(john.publicKey,blog_pkey,programId);

          try{
            await program.methods.tipForBlog(blog_tip_john1)
            .accounts({
              tipAuthor:john.publicKey,
              tip:tip_pkey,
              blog:blog_pkey,
              system_program:anchor.web3.SystemProgram.programId
            }).signers([john]).rpc({commitment:"confirmed"});
          }
          catch(err){
            const error=anchor.AnchorError.parse(err.logs)
            const errorCode=error.error.errorCode.code;
            assert.strictEqual(errorCode,"AccountNotInitialized","AccountNotInitialized Error : blog doesn't exist");
          }
          
        })
    });

    describe("Add Comment",async()=>{
       
      it("should add comment with valid length",async()=>{
          await requestAirdrop(provider.connection,bob.publicKey);
          await requestAirdrop(provider.connection,alice.publicKey);
          await requestAirdrop(provider.connection,john.publicKey);
              
          const [blog_pkey]=getBlogAddress(blog_title_bob1,bob.publicKey,programId);
          const [comment_pkey,comment_bump]=getCommentAddress(blog_comment_bob1,bob.publicKey,blog_pkey,programId);

          await program.methods.commentBlog(blog_comment_bob1)
          .accounts({
            commentAuthor:bob.publicKey,
            comment:comment_pkey,
            blog:blog_pkey,
            system_program:anchor.web3.SystemProgram.programId
          })
          .signers([bob]).rpc({commitment:"confirmed"});

          checkComment(program,comment_pkey,bob.publicKey,blog_pkey,comment_bump);
      })
      it("should fail to add comment when comment exceeds 400 bytes",async()=>{
          const [blog_pkey]=getBlogAddress(blog_title_bob1,bob.publicKey,programId);
          const [comment_pkey]=getCommentAddress(comment_content_more_than_400_bytes,alice.publicKey,blog_pkey,programId);
          try{
               await program.methods.commentBlog(comment_content_more_than_400_bytes)
                .accounts({
                  commentAuthor:alice.publicKey,
                  comment:comment_pkey,
                  blog:blog_pkey,
                  system_program:anchor.web3.SystemProgram.programId
                })
                .signers([alice]).rpc({commitment:"confirmed"});
          }
          catch(err){
              const error=anchor.AnchorError.parse(err.logs)
              const errorCode=error.error.errorCode.code;
              assert.strictEqual(errorCode,"CommentTooLong","CommentTooLong Error if comment exceeds 400 bytes");
          }
      })
      it("should allow mutiple users to comment on same blog",async()=>{
          const [blog_pkey]=getBlogAddress(blog_title_bob1,bob.publicKey,programId);
          const [comment_pkey,comment_bump]=getCommentAddress(blog_comment_john1,john.publicKey,blog_pkey,programId);

          await program.methods.commentBlog(blog_comment_john1)
          .accounts({
            commentAuthor:john.publicKey,
            comment:comment_pkey,
            blog:blog_pkey,
            system_program:anchor.web3.SystemProgram.programId
          })
          .signers([john]).rpc({commitment:"confirmed"});

          checkComment(program,comment_pkey,john.publicKey,blog_pkey,comment_bump);
      })
      it("should fail to create duplicate comment with same content",async()=>{
          const [blog_pkey]=getBlogAddress(blog_title_bob1,bob.publicKey,programId);
          const [comment_pkey]=getCommentAddress(blog_comment_john1,john.publicKey,blog_pkey,programId);

            let failed=false;
           try{
              await program.methods.commentBlog(blog_comment_john1)
              .accounts({
                commentAuthor:john.publicKey,
                comment:comment_pkey,
                blog:blog_pkey,
                system_program:anchor.web3.SystemProgram.programId
              })
              .signers([john]).rpc({commitment:"confirmed"});
           }
           catch(err){
             failed=err.logs.some((log)=>log.includes('already in use'));
            assert.strictEqual(failed,true,"Transaction should have failed")          
          }

      })
      it("should fail to add comment on non-existent blog",async()=>{
          const [blog_pkey]=getBlogAddress("non-existent blog title",bob.publicKey,programId);
          const [comment_pkey]=getCommentAddress(blog_comment_john1,john.publicKey,blog_pkey,programId);

           try{
              await program.methods.commentBlog(blog_comment_john1)
              .accounts({
                commentAuthor:john.publicKey,
                comment:comment_pkey,
                blog:blog_pkey,
                system_program:anchor.web3.SystemProgram.programId
              })
              .signers([john]).rpc({commitment:"confirmed"});
           }
           catch(err){
         const error=anchor.AnchorError.parse(err.logs)
         const errorCode=error.error.errorCode.code;
          assert.strictEqual(errorCode,"AccountNotInitialized","AccountNotInitialized Error: bookmark doesn't exist");           }

      })
    
    });
    describe("Remove Comment",async()=>{
      it("should allow users to remove their comment",async()=>{
        const [blog_pkey]=getBlogAddress(blog_title_bob1,bob.publicKey,programId);
        const [comment_pkey]=getCommentAddress(blog_comment_bob1,bob.publicKey,blog_pkey,programId);

        await program.methods.removeCommentBlog()
        .accounts({
          commentAuthor:bob.publicKey,
          comment:comment_pkey
        }).signers([bob]).rpc({commitment:"confirmed"});

        let failed=false;
        try{
          await program.account.comment.fetch(comment_pkey);
        }
        catch(err){
          failed=err?.message.includes("Account does not exist");
         assert.strictEqual(failed,true,"Transaction should have failed")
        }
      })
      it("should fail to remove others comment",async()=>{
        await requestAirdrop(provider.connection,alice.publicKey);
        const [blog_pkey]=getBlogAddress(blog_title_bob1,bob.publicKey,programId);
        const [comment_pkey]=getCommentAddress(blog_comment_bob1,bob.publicKey,blog_pkey,programId);      

         let failed=false;
        try{
         await program.methods.removeCommentBlog()
        .accounts({
          commentAuthor:bob.publicKey,
          comment:comment_pkey
        }).signers([alice]).rpc({commitment:"confirmed"});
        }
        catch(err){
          failed=err?.message?.includes("unknown signer");
          assert.strictEqual(failed,true,"Transaction should have failed.");        
        }
      })
      it("should fail to remove non-existent comment",async()=>{
        const [blog_pkey]=getBlogAddress(blog_title_bob1,bob.publicKey,programId);
        const [comment_pkey]=getCommentAddress("non-existing bob comment",bob.publicKey,blog_pkey,programId);      

        try{
         await program.methods.removeCommentBlog()
        .accounts({
          commentAuthor:bob.publicKey,
          comment:comment_pkey
        }).signers([bob]).rpc({commitment:"confirmed"});
        }
        catch(err){
        const error=anchor.AnchorError.parse(err.logs)
         const errorCode=error.error.errorCode.code;
          assert.strictEqual(errorCode,"AccountNotInitialized","AccountNotInitialized Error: comment doesn't exist");      
        }
      })
    });

    describe("Add Reaction",async()=>{
       
     it("should allow users to add reaction to their own blog",async()=>{
        await requestAirdrop(provider.connection,bob.publicKey);
        await requestAirdrop(provider.connection,alice.publicKey);
        
        const [blog_pkey,blog_bump]=getBlogAddress(blog_title_bob1,bob.publicKey,programId);
        const [reaction_pkey,reaction_bump]=getReactionAddress(bob.publicKey,blog_pkey,programId);

        await program.methods.likeBlog()
        .accounts({
          reactionAuthor:bob.publicKey,
          reaction:reaction_pkey,
          blog:blog_pkey,
          system_program:anchor.web3.SystemProgram.programId
        }).signers([bob]).rpc({commitment:"confirmed"});

        checkBlog(program,blog_pkey,bob.publicKey,blog_title_bob1,blog_content_bob1,1,0,blog_bump);
        checkReaction(program,reaction_pkey,bob.publicKey,blog_pkey,reaction_bump);
     })
     it("should allow users to add reaction to other's blog",async()=>{
        const [blog_pkey,blog_bump]=getBlogAddress(blog_title_bob1,bob.publicKey,programId);
        const [reaction_pkey,reaction_bump]=getReactionAddress(alice.publicKey,blog_pkey,programId);

        await program.methods.likeBlog()
        .accounts({
          reactionAuthor:alice.publicKey,
          reaction:reaction_pkey,
          blog:blog_pkey,
          system_program:anchor.web3.SystemProgram.programId
        }).signers([alice]).rpc({commitment:"confirmed"});

         checkBlog(program,blog_pkey,bob.publicKey,blog_title_bob1,blog_content_bob1,2,0,blog_bump);
        checkReaction(program,reaction_pkey,alice.publicKey,blog_pkey,reaction_bump);
     })
     it("should fail to add reaction to same blog twice",async()=>{
       const [blog_pkey]=getBlogAddress(blog_title_bob1,bob.publicKey,programId);
       const [reaction_pkey]=getReactionAddress(bob.publicKey,blog_pkey,programId);
           
       let failed=false;
      try{
          await program.methods.dislikeBlog()
        .accounts({
          reactionAuthor:bob.publicKey,
          reaction:reaction_pkey,
          blog:blog_pkey,
          system_program:anchor.web3.SystemProgram.programId
        }).signers([bob]).rpc({commitment:"confirmed"});
      }
      catch(err){
          failed=err.logs.some((log)=>log.includes('already in use'));
          assert.strictEqual(failed,true,"Transaction should have failed")
      }
     })
     it("should fail to like non-existent blog",async()=>{
       const [blog_pkey]=getBlogAddress("non-existent blog title ",bob.publicKey,programId);
        const [reaction_pkey]=getReactionAddress(bob.publicKey,blog_pkey,programId);

      try{
          await program.methods.dislikeBlog()
        .accounts({
          reactionAuthor:bob.publicKey,
          reaction:reaction_pkey,
          blog:blog_pkey,
          system_program:anchor.web3.SystemProgram.programId
        }).signers([bob]).rpc({commitment:"confirmed"});
      }
      catch(err){
          const errorCode=err.error.errorCode.code;
          assert.strictEqual(errorCode,"AccountNotInitialized","AccountNotInitialized Error: blog doesn't exist");            }
     })
    });
    describe("Remove Reaction",async()=>{
      it("should allow users to remove their reaction from blog",async()=>{
        const [blog_pkey,blog_bump]=getBlogAddress(blog_title_bob1,bob.publicKey,programId);
        const [reaction_pkey]=getReactionAddress(bob.publicKey,blog_pkey,programId);

        await program.methods.removeReactionBlog()
        .accounts({
          reactionAuthor:bob.publicKey,
          reaction:reaction_pkey,
          blog:blog_pkey
        })
        .signers([bob]).rpc({commitment:"confirmed"});

         checkBlog(program,blog_pkey,bob.publicKey,blog_title_bob1,blog_content_bob1,1,0,blog_bump);
      })
      it("should not allow users to remove other's reaction",async()=>{
         const [blog_pkey]=getBlogAddress(blog_title_bob1,bob.publicKey,programId);
        const [reaction_pkey]=getReactionAddress(bob.publicKey,blog_pkey,programId);

        let failed=false;
        try{
             await program.methods.removeReactionBlog()
            .accounts({
              reactionAuthor:alice.publicKey,
              reaction:reaction_pkey,
              blog:blog_pkey
            })
            .signers([bob]).rpc({commitment:"confirmed"});
        }
        catch(err){
          failed=err?.message?.includes("unknown signer");
          assert.strictEqual(failed,true,"Transaction should have failed");        
      }

      })
      it("should fail to remove non-existent reaction",async()=>{
         const [blog_pkey]=getBlogAddress("non existent blog title",bob.publicKey,programId);
        const [reaction_pkey]=getReactionAddress(bob.publicKey,blog_pkey,programId);

        try{
             await program.methods.removeReactionBlog()
            .accounts({
              reactionAuthor:bob.publicKey,
              reaction:reaction_pkey,
              blog:blog_pkey
            })
            .signers([bob]).rpc({commitment:"confirmed"});
        }
        catch(err){
            const error=anchor.AnchorError.parse(err.logs)
            const errorCode=error.error.errorCode.code;
              assert.strictEqual(errorCode,"AccountNotInitialized","AccountNotInitialized Error: reaction doesn't exist");        }

      })

    });

   
});


async function requestAirdrop(connection:Connection,to:PublicKey,amt=10){
   const sign=await connection.requestAirdrop(to,amt*LAMPORTS_PER_SOL);
   await connection.confirmTransaction(sign,"confirmed");
}

 function getBlogAddress(title:string,blog_author:PublicKey,programId:PublicKey){

  return PublicKey.findProgramAddressSync([
    anchor.utils.bytes.utf8.encode("BLOG_SEED"),
    anchor.utils.bytes.utf8.encode(title),
  blog_author.toBuffer()
  ],programId);
}

 function getCommentAddress(comment:string,comment_author:PublicKey,blog_pkey:PublicKey,programId:PublicKey){
    const hashed_comment=crypto.createHash('sha256').update(comment,'utf-8').digest();
  return PublicKey.findProgramAddressSync([
    anchor.utils.bytes.utf8.encode("COMMENT_SEED"),
    hashed_comment,
    comment_author.toBuffer(),
    blog_pkey.toBuffer(),
  ],programId);
}
 function getReactionAddress(reaction_author:PublicKey,blog:PublicKey,programId:PublicKey){
  return PublicKey.findProgramAddressSync([
    anchor.utils.bytes.utf8.encode("REACTION_SEED"),
    reaction_author.toBuffer(),
    blog.toBuffer()
  ],programId);
}
 function getBookmarkAddress(bookmark_author:PublicKey,blog:PublicKey,programId:PublicKey){
  return PublicKey.findProgramAddressSync([
    anchor.utils.bytes.utf8.encode("BOOKMARK_SEED"),
    bookmark_author.toBuffer(),
    blog.toBuffer()
  ],programId);
}
 function getTipAddress(tip_author:PublicKey,blog:PublicKey,programId:PublicKey){
  return PublicKey.findProgramAddressSync([
    anchor.utils.bytes.utf8.encode("TIP_SEED"),
    tip_author.toBuffer(),
  blog.toBuffer()
  ],programId);
}


async function checkBlog(
  program:Program<BlogDapp>,
  blog_pkey:PublicKey,
  blog_author_pkey?:PublicKey,
  blog_title?:string,
  blog_content?:string,
  blog_likes?:number,
  blog_dislikes?:number,
  bump?:number,
  bookmarked?:number
){

  const blog_data= await program.account.blog.fetch(blog_pkey);

    if(blog_author_pkey){
      assert.strictEqual(blog_data.blogAuthor.toString(),blog_author_pkey.toString(),`Blog author key ${blog_data.blogAuthor.toString()} doesnt match with actual blog author's key: ${blog_author_pkey.toString()} `);
    }
    if(blog_title){
      assert.strictEqual(blog_data.title,blog_title,`Blog title should be ${blog_title} but was ${blog_data.title}`);
    }
    if(blog_content){
      assert.strictEqual(blog_data.content,blog_content,`Blog content should be ${blog_content} but was ${blog_data.content}`);
    }
    if(blog_likes || blog_likes==0){
       assert.strictEqual(blog_data.likes.toString(),new anchor.BN(blog_likes).toString(),`Blog likes should be ${blog_likes} but was ${blog_data.likes.toString()}.`);
    }
    if(blog_dislikes || blog_dislikes==0){
       assert.strictEqual(blog_data.dislikes.toString(),new anchor.BN(blog_dislikes).toString(),`Blog dislikes should be ${blog_dislikes} but was ${blog_data.dislikes.toString()}.`);
    }
    if(bump){
       assert.strictEqual(blog_data.bump.toString(),bump.toString(),`Blog bump should be ${bump} but was ${blog_data.bump}.`);
    }
    if(bookmarked || bookmarked==0){
       assert.strictEqual(blog_data.bookmarked.toString(),bookmarked.toString(),`Blog bookmarked should be ${bookmarked} but was ${blog_data.bookmarked}.`);
    }

}

async function checkBookmark(
  program:Program<BlogDapp>,
  bookmark_pkey:PublicKey,
  bookmark_author_pkey:PublicKey,
  related_blog_pkey:PublicKey,
  bump?:number
){

  const bookmark_data=await program.account.bookmark.fetch(bookmark_pkey);

  if(bookmark_author_pkey){
    assert.strictEqual(bookmark_data.bookmarkAuthor.toString(),bookmark_author_pkey.toString(),`Bookmark author key ${bookmark_data.bookmarkAuthor.toString()} doesn't match with actual bookmark author's key: ${bookmark_author_pkey} `);
  }
  if(related_blog_pkey){
    assert.strictEqual(bookmark_data.relatedBlog.toString(),related_blog_pkey.toString(),`Bookmark related blog key should be ${related_blog_pkey.toString()} but was ${bookmark_data.relatedBlog.toString()}`)
  }
  if(bump){
   assert.strictEqual(bookmark_data.bump.toString(),bump.toString(),`Bookmakr bump should be ${bump} but was ${bookmark_data.bump}.`);
  }
}

async function checkComment(
  program:Program<BlogDapp>,
  comment_pkey:PublicKey,
  comment_author_pkey:PublicKey,
  related_blog_pkey:PublicKey,
 bump?:number
){

   const comment_data=await program.account.comment.fetch(comment_pkey);

  if(comment_author_pkey){
    assert.strictEqual(comment_data.commentAuthor.toString(),comment_author_pkey.toString(),`Comment author key ${comment_data.commentAuthor.toString()} doesn't match with actual Comment author's key: ${comment_author_pkey.toString()} `);
  }
  if(related_blog_pkey){
    assert.strictEqual(comment_data.relatedBlog.toString(),related_blog_pkey.toString(),`Comment related blog key should be ${related_blog_pkey.toString()} but was ${comment_data.relatedBlog.toString()}`)
  }
  if(bump){
   assert.strictEqual(comment_data.bump.toString(),bump.toString(),`Bookmakr bump should be ${bump} but was ${comment_data.bump}.`);
  }
}

async function checkReaction(
  program:Program<BlogDapp>,
  reaction_pkey:PublicKey,
  reaction_author_pkey:PublicKey,
  related_blog_pkey:PublicKey,
  bump?:number
){
 
  const reaction_data=await program.account.reaction.fetch(reaction_pkey);

    if(reaction_author_pkey){
    assert.strictEqual(reaction_data.reactionAuthor.toString(),reaction_author_pkey.toString(),`Reaction author key ${reaction_data.reactionAuthor.toString()} doesn't match with actual Reaction author's key: ${reaction_author_pkey.toString()} `);
  }
  if(related_blog_pkey){
    assert.strictEqual(reaction_data.relatedBlog.toString(),related_blog_pkey.toString(),`Reaction related blog key should be ${related_blog_pkey.toString()} but was ${reaction_data.relatedBlog.toString()}`)
  }
  if(bump){
   assert.strictEqual(reaction_data.bump.toString(),bump.toString(),`Reaction bump should be ${bump} but was ${reaction_data.bump}.`);
  }
  
}
async function checkTip(
  program:Program<BlogDapp>,
  tip_pkey:PublicKey,
  tip_author_pkey:PublicKey,
  related_blog_pkey:PublicKey,
  total_tip?:BN,
  bump?:number
){
  
  const tip_data=await program.account.tip.fetch(tip_pkey);

    if(tip_author_pkey){
    assert.strictEqual(tip_data.tipAuthor.toString(),tip_author_pkey.toString(),`Tip author key ${tip_data.tipAuthor.toString()} doesn't match with actual Tip author's key: ${tip_author_pkey.toString()} `);
  }
  if(related_blog_pkey){
    assert.strictEqual(tip_data.relatedBlog.toString(),related_blog_pkey.toString(),`Tip related blog key should be ${related_blog_pkey.toString()} but was ${tip_data.relatedBlog.toString()}`)
  }
  if(total_tip){
    assert.strictEqual(tip_data.totalTip.toString(),total_tip.toString(),`Total tip should be ${total_tip} but was ${tip_data.totalTip}.`);
  }
  if(bump){
   assert.strictEqual(tip_data.bump.toString(),bump.toString(),`Tip bump should be ${bump} but was ${tip_data.bump}.`);
  }
}