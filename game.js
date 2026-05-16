const board = document.querySelector(".board")

let turn = "white"
let selected = null
let selectedPiece = ""
let selectedRow = 0
let selectedCol = 0

let capturedW = []
let capturedB = []

let lastMove = null

// ================= PIECES =================
function isWhite(p){
    return ["♙","♖","♘","♗","♕","♔"].includes(p)
}

// ================= FIND KING =================
function findKing(color){
    return [...document.querySelectorAll(".square")]
        .find(s => color==="white" ? s.textContent==="♔" : s.textContent==="♚")
}

// ================= CHECK =================
function isCheck(color){

    const king = findKing(color)
    if(!king) return false

    const kr = +king.dataset.row
    const kc = +king.dataset.col

    for(let sq of document.querySelectorAll(".square")){

        const p = sq.textContent
        if(p==="") continue

        const r = +sq.dataset.row
        const c = +sq.dataset.col

        if(color==="white" && !isWhite(p)){
            if(canAttack(p,r,c,kr,kc)) return true
        }

        if(color==="black" && isWhite(p)){
            if(canAttack(p,r,c,kr,kc)) return true
        }
    }
    return false
}

// ================= ATTACK RULES =================
function canAttack(p,sr,sc,tr,tc){

    let dr = Math.abs(tr-sr)
    let dc = Math.abs(tc-sc)

    if(p==="♙") return dr===1 && dc===1 && tr<sr
    if(p==="♟") return dr===1 && dc===1 && tr>sr

    if(["♘","♞"].includes(p))
        return (dr===2&&dc===1)||(dr===1&&dc===2)

    if(["♖","♜"].includes(p))
        return sr===tr||sc===tc

    if(["♗","♝"].includes(p))
        return dr===dc

    if(["♕","♛"].includes(p))
        return sr===tr||sc===tc||dr===dc

    if(["♔","♚"].includes(p))
        return dr<=1&&dc<=1
}

// ================= PATH CHECK =================
function pathClear(sr,sc,tr,tc){

    let dr=Math.sign(tr-sr)
    let dc=Math.sign(tc-sc)

    let r=sr+dr
    let c=sc+dc

    while(r!==tr || c!==tc){

        let sq=document.querySelector(`[data-row="${r}"][data-col="${c}"]`)
        if(sq.textContent!=="") return false

        r+=dr
        c+=dc
    }
    return true
}

// ================= SAFE MOVE (VERY IMPORTANT) =================
function safeMove(from,to,piece){

    const a = from.textContent
    const b = to.textContent

    to.textContent = piece
    from.textContent = ""

    let ok = !isCheck(isWhite(piece) ? "white" : "black")

    from.textContent = a
    to.textContent = b

    return ok
}

// ================= CASTLING =================
function canCastle(color, side){

    const row = color==="white"?7:0

    const king = document.querySelector(`[data-row="${row}"][data-col="4"]`)
    if(!king || king.textContent !== (color==="white"?"♔":"♚")) return false

    if(isCheck(color)) return false

    if(side==="kingSide"){
        const rook = document.querySelector(`[data-row="${row}"][data-col="7"]`)
        if(!rook || rook.textContent===(color==="white"?"♖":"♜")) return false
        return true
    }

    if(side==="queenSide"){
        const rook = document.querySelector(`[data-row="${row}"][data-col="0"]`)
        if(!rook || rook.textContent===(color==="white"?"♖":"♜")) return false
        return true
    }
}

// ================= BOARD =================
for(let r=0;r<8;r++){
for(let c=0;c<8;c++){

    const sq=document.createElement("div")
    sq.classList.add("square")
    sq.dataset.row=r
    sq.dataset.col=c

    if((r+c)%2===0) sq.classList.add("white")
    else sq.classList.add("black")

    let piece=""

    if(r===0) piece=["♜","♞","♝","♛","♚","♝","♞","♜"][c]
    if(r===1) piece="♟"
    if(r===6) piece="♙"
    if(r===7) piece=["♖","♘","♗","♕","♔","♗","♘","♖"][c]

    sq.textContent=piece

    sq.onclick=()=>{

        let r2=+sq.dataset.row
        let c2=+sq.dataset.col
        let p=sq.textContent

        // SELECT
        if(!selected && p!==""){

            if(turn==="white" && !isWhite(p)) return
            if(turn==="black" && isWhite(p)) return

            selected=sq
            selectedPiece=p
            selectedRow=r2
            selectedCol=c2
            sq.style.outline="3px solid red"
            return
        }

        // MOVE
        if(selected){

            let dr=Math.abs(r2-selectedRow)
            let dc=Math.abs(c2-selectedCol)

            let ok=false

            // pawn
            if(selectedPiece==="♙"){
                if(c2===selectedCol && r2===selectedRow-1 && sq.textContent==="") ok=true
                if(selectedRow===7-1 && c2===selectedCol && r2===selectedRow-2) ok=true
                if(dc===1 && r2===selectedRow-1 && sq.textContent!=="" && !isWhite(sq.textContent)) ok=true
            }

            if(selectedPiece==="♟"){
                if(c2===selectedCol && r2===selectedRow+1 && sq.textContent==="") ok=true
                if(selectedRow===1 && c2===selectedCol && r2===selectedRow+2) ok=true
                if(dc===1 && r2===selectedRow+1 && sq.textContent!=="" && isWhite(sq.textContent)) ok=true
            }

            // knight
            if(["♘","♞"].includes(selectedPiece)){
                if((dr===2&&dc===1)||(dr===1&&dc===2)) ok=true
            }

            // rook
            if(["♖","♜"].includes(selectedPiece)){
                if((selectedRow===r2||selectedCol===c2)&&pathClear(selectedRow,selectedCol,r2,c2)) ok=true
            }

            // bishop
            if(["♗","♝"].includes(selectedPiece)){
                if(dr===dc&&pathClear(selectedRow,selectedCol,r2,c2)) ok=true
            }

            // queen
            if(["♕","♛"].includes(selectedPiece)){
                if((selectedRow===r2||selectedCol===c2||dr===dc)&&pathClear(selectedRow,selectedCol,r2,c2)) ok=true
            }

            // king
            if(["♔","♚"].includes(selectedPiece)){
                if(dr<=1&&dc<=1) ok=true
            }

            // FINAL RULE (CHESS.COM STYLE)
            if(ok && safeMove(selected,sq,selectedPiece)){

                const target=sq.textContent

                if(target!==""){
                    if(isWhite(target)) capturedW.push(target)
                    else capturedB.push(target)
                }

                sq.textContent=selectedPiece
                selected.textContent=""

                turn = turn==="white"?"black":"white"
            }

            selected.style.outline=""
            selected=null
        }
    }

    board.appendChild(sq)
}}