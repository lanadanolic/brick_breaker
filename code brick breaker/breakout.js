//board
let board;
let boardwidth = 500;  //right border
let boardheight = 500;  
let context;

//player
let playerwidth = 80;
let playerheight = 10;
let playervelocityx = 10;  //player will move to 10px in each frame

let player = 
{
    x : boardwidth/2 - playerwidth/2,  //to center a board
    y : boardheight - playerheight - 5,  //5 so it wont stick onto the canvas
    width: playerwidth,
    height : playerheight,
    velocityx : playervelocityx
}

//ball
let ballwidth = 10;
let ballheight = 10;
let ballvelocityx = 3;
let ballvelocityy = 2;
 //object for the ball
let ball =
{
    x : boardwidth/2,
    y : boardheight/2, 
    width : ballwidth,
    height : ballheight,
    velocityx : ballvelocityx,
    velocityy : ballvelocityy
}


//blocks
let blockarray = [];
let blockwidth = 50;
let blockheight = 10;
let blockcolumns = 8;
let blockrows = 3; //add more as game goes on
let blockmaxrows = 10;  //limit how many rows
let blockcount = 0;  //how many blocks are there, when we destroy 1, it decreases for 1

//starting block corner
let blockx = 15;
let blocky = 45;

//score
let score = 0;
let gameover = false;


window.onload = function()
{
    board = document.getElementById("board");
    board.height = boardheight;
    board.width = boardwidth;
    context = board.getContext("2d"); //for drawing on the board

    //draw initial player
    context.fillStyle = "skyblue";
    context.fillRect(player.x, player.y, player.width, player.height);

    requestAnimationFrame(update);
    document.addEventListener("keydown", movePlayer);

    //create blocks
    createblocks();
}

function update()
{
    requestAnimationFrame(update);
    if(gameover)
    {
        return;
    }

    context.clearRect(0,0, board.width, board.height);  //clearing the previous frame
    //player
    context.fillStyle = "green";
    context.fillRect(player.x, player.y, player.width, player.height);

    context.fillStyle = "white"; //for the ball
    ball.x += ball.velocityx;
    ball.y += ball.velocityy;
    context.fillRect(ball.x, ball.y, ball.width, ball.height);

    //bounce ball of the walls
    if(ball.y <= 0) //top of the canvas
    {
         ball.velocityy *= -1;  //reverse direction
    }
    else if (ball.x <= 0 || (ball.x + ball.width) >= boardwidth) //left border or right border
    {
          ball.velocityx *= -1;  //reverse direction
    }
      else if (ball.y + ball.height >= boardheight) //bottom of the canvas
    {
          //game over 
          context.font = "20px sans-serif";
          context.fillText("game over, press space to restart", 80, 400); //right, down
          gameover = true;
    }

    //bouncing the ball off player paddle
    if (topcollision(ball, player) || bottomcollision(ball, player))
    {
        //flip the velocity y up or down
        ball.velocityy *= -1;
    }
    else if (leftcollision(ball, player) || rightcollision(ball, player))
    {
        ball.velocityx *= -1;  //flip right or left
    }

    //blocks
    context.fillStyle = "skyblue";
    for (let i = 0; i<blockarray.length; i++)
    {
        let block = blockarray[i];
        if (!block.break)
        {
            if(topcollision(ball, block) || bottomcollision(ball, block))
            {
                block.break = true;
                ball.velocityy *= -1;  //flip the y direction up or down
                blockcount -= 1;
                score += 100;
                //break; //break out of the loop after hitting one block

            }
            else if (leftcollision(ball, block) || rightcollision(ball, block))
            {
                block.break = true;
                ball.velocityx *= -1; //flip the x direction left or right
                blockcount -= 1;
                score += 100;
                //break;
            }
            context.fillRect(block.x, block.y, block.width, block.height);
        }
    }

    //next level
     if(blockcount==0)
     {
        score += 100*blockrows*blockcolumns; //bonus points
        blockrows=Math.min(blockrows+1, blockmaxrows); //adding the another row
        createblocks();
     }

    //score
    context.font = "20px sans-serif";
    context.fillText (score, 10, 25);   //right, down
}


function outofbounds(xposition) //da ne prolazi rubove okvira
{
    return (xposition < 0 || xposition + playerwidth > boardwidth); //we have gone pass the left screen or passed the right screen
}


function movePlayer(e)
{
    if (gameover)
    {
         if (e.code == "Space")
         {
            resetgame();
         }
    }

    if (e.code == "ArrowLeft")
    {
        //player.x -= player.velocityx;
        let nextplayerx = player.x - player.velocityx;
        if (!outofbounds(nextplayerx))
        {
            player.x = nextplayerx;
        }
    }
    else if (e.code == "ArrowRight")
    {
        //player.x += player.velocityx;
        let nextplayerx = player.x + player.velocityx;
        if (!outofbounds(nextplayerx))
            {
                player.x = nextplayerx;
            }
    }
}

function detectcollision(a,b)
{
    return a.x < b.x + b.width &&
           a.x + a.width > b.x && 
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}


function topcollision (ball, block)  //a is ball, b iz block (ball is above block)
{
    return detectcollision(ball, block)  && (ball.y + ball.height) >= block.y;
}

function bottomcollision (ball, block)  //a is below b (ball is bellow block)
{
    return detectcollision(ball, block) && (block.y + block.height) >= ball.y;
}

function leftcollision (ball, block) //a is left of b (ball is left of block)
{
    return detectcollision(ball, block) && (ball.x + ball.width) >= block.x;
}

function rightcollision (ball, block)  //a is right of b (ball is right of block)
{
 return detectcollision(ball, block) && (block.x + block.width) >= ball.x;
}


function createblocks()
{
    blockarray = []; //clear block array
    for (let c = 0; c<blockcolumns; c++)
    {
        for (let r = 0; r< blockrows; r++)
        {
            let block =
            {
                x : blockx + c*blockwidth + c*10, //c * 10 -> space 10 pixels appart
                y : blocky + r*blockheight + r*10, //for rows
                width : blockwidth,
                height : blockheight,
                break : false 
            }
            blockarray.push(block);
        }
    }
    blockcount = blockarray.length;
}

function resetgame()
{
    gameover = false;
    //player and the ball back to its starting position
     player = 
   {
       x : boardwidth/2 - playerwidth/2,  //to center a board
       y : boardheight - playerheight - 5,  //5 so it wont stick onto the canvas
       width: playerwidth,
       height : playerheight,
       velocityx : playervelocityx
    }

    ball =
    {
       x : boardwidth/2,
       y : boardheight/2, 
       width : ballwidth,
       height : ballheight,
       velocityx : ballvelocityx,
       velocityy : ballvelocityy
    }
     blockarray = []; //reseting array
     blockrows = 3; //resetting the game from the first level
     score = 0;
     createblocks();

}