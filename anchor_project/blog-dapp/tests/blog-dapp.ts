import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { BlogDapp } from "../target/types/blog_dapp";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { assert } from "chai";
import crypto from 'crypto';

describe("blog-dapp", () => {
  // Configure the client to use the local cluster.
  const provider=anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  

  const program = anchor.workspace.blogDapp as Program<BlogDapp>;
  const programId=program.programId;
  
  const bob=anchor.web3.Keypair.generate();
  const alice=anchor.web3.Keypair.generate();

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
    let blog_content_more_than_800_bytes="content".repeat(116);

    const blog_title_bob4="different topic with same user";
    const blog_content_bob4="this blog content related to test that should initialize blog with differnt topic and same author";

    //update blog---
    const blog_updated_content_bob1="This is updated content of react by bob. React is fronend ui library zz zz zz zz zz zz zzz zzz zz that provides reusable components.";
    const blog_updated_content_alice1="This is updated content of react by alice. React is fronend ui library zz zz zz zz zz zz zzz zzz zz that provides reusable components.";
    

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
        it("should fail to initialize duplicate blog with same topic and author",async()=>{
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
        it("should initialize blog with differnt topic and same author",async()=>{
            const [blog_pkey,blog_bump]= getBlogAddress(blog_title_bob4,bob.publicKey,programId);

              await program.methods.addBlog(blog_title_bob4,blog_content_bob4)
              .accounts({
                blogAuthor:bob.publicKey,
                blog:blog_pkey,
                system_program:anchor.web3.SystemProgram.programId
            }).signers([bob]).rpc({commitment:"confirmed"});
            
          await checkBlog(program,blog_pkey,bob.publicKey,blog_title_bob4,blog_content_bob4,0,0,blog_bump);

        })
        it("should initialize blog with same topic and different author",async()=>{
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
    describe("remove blog",async ()=>{
       
    });
    describe("Save/Bookmarked Blog",async()=>{

    });
    describe("Remove bookmarked Blog",async()=>{

    });
    describe("Remove bookmarked Blog",async()=>{

    });
    describe("Add Tip to Blog",async()=>{

    });

    describe("Add Comment",async()=>{

    });
    describe("Remove Comment",async()=>{

    });
    describe("Add Reaction",async()=>{

    });
    describe("Remove Reaction",async()=>{

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

 function getCommentAddress(title:string,blog_author:PublicKey,programId:PublicKey){
    // const hash_title=crypto.createHash('sha256').update(title,'utf-8').digest();
  return PublicKey.findProgramAddressSync([
    anchor.utils.bytes.utf8.encode("COMMENT_SEED"),
   anchor.utils.bytes.utf8.encode(title),
  blog_author.toBuffer()
  ],programId);
}
 function getReactionAddress(title:string,blog_author:PublicKey,programId:PublicKey){
  return PublicKey.findProgramAddressSync([
    anchor.utils.bytes.utf8.encode("BLOG_SEED"),
   anchor.utils.bytes.utf8.encode(title),
  blog_author.toBuffer()
  ],programId);
}
 function getBookmarkAddress(title:string,blog_author:PublicKey,programId:PublicKey){
  return PublicKey.findProgramAddressSync([
    anchor.utils.bytes.utf8.encode("BLOG_SEED"),
   anchor.utils.bytes.utf8.encode(title),
  blog_author.toBuffer()
  ],programId);
}
 function getTipAddress(title:string,blog_author:PublicKey,programId:PublicKey){
  return PublicKey.findProgramAddressSync([
    anchor.utils.bytes.utf8.encode("BLOG_SEED"),
   anchor.utils.bytes.utf8.encode(title),
  blog_author.toBuffer()
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
  bump?:number
){

  const blog_data= await program.account.blog.fetch(blog_pkey);
  // console.log('284..',blog_data.blogAuthor,blog_data.content);

    if(blog_author_pkey){
      assert.strictEqual(blog_data.blogAuthor.toString(),blog_author_pkey.toString(),`Blog author key ${blog_data.blogAuthor.toString()} doesnt match with actual blog author's key: ${blog_author_pkey} `);
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

}