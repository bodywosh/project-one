window.onload = () => {
    const canvas = document.getElementById('canvas')
    const canvasHeight = canvas.height
    const canvasWidth = canvas.width
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    ctx.font = '16px Aerial'
    let gameStarted = false
    let gameDifficulty = 'easy'
    const loremIpsum = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
    let mobs = []

    class Sprite{
        constructor(){
            this.numColumns = 4
            this.frameWidth = 32
            this.frameHeight = 32
            this.currentFrame = 0 
            this.avatarDown = new Image()
            this.avatarDown.onload = () => {}
            this.avatarDown.src = 'Character_Down.png'
            this.avatarUp = new Image()
            this.avatarUp.onload = () => {}
            this.avatarUp.src = 'Character_Up.png'
            this.avatarLeft = new Image()
            this.avatarLeft.onload = () => {}
            this.avatarLeft.src = 'Character_Left.png'
            this.avatarRight = new Image()
            this.avatarRight.onload = () => {}
            this.avatarRight.src = 'Character_Right.png'
            this.lastDirection = 'Down'
        }

        draw(direction,x,y){
            if(direction==='Idle'){
                ctx.drawImage(this[`avatar${this.lastDirection}`], 0, 0, this.frameWidth, this.frameHeight, x, y, this.frameWidth, this.frameHeight) 
                return 
            }

            this.lastDirection = direction
            this.currentFrame++
            let maxFrame = this.numColumns - 1
            if (this.currentFrame > maxFrame){
                this.currentFrame = 0
            }
            let column = this.currentFrame % this.numColumns;

            ctx.drawImage(this[`avatar${direction}`], column * this.frameWidth, 0, this.frameWidth, this.frameHeight, x, y, this.frameWidth, this.frameHeight)
        }
    }

    class Character{
        constructor(){
            this.movingUp = false
            this.movingDown = false
            this.movingRight = false
            this.movingLeft = false
            this.speed = 4
            this.text = ''
            this.prompt = 'start'
            this.activeWord = 'start'
            this.height = 32
            this.width = 32
            this.recover = false
            this.maxHealth = 5
            this.lives = 3
            this.y = canvasHeight/2 - this.height/2
            this.x = canvasWidth/2 - this.width/2
            this.avatar = new Sprite()
            this.incantation = purgeString(loremIpsum)

            document.addEventListener('keydown',(event) => {
                switch(event.key){
                    case 'ArrowRight' :
                        this.movingLeft = false
                        this.movingRight = true
                        break
                    case 'ArrowLeft' :
                        this.movingRight = false
                        this.movingLeft = true
                        break
                    case 'ArrowUp' :
                        this.movingDown = false
                        this.movingUp = true
                        break
                    case 'ArrowDown' :
                        this.movingUp = false
                        this.movingDown = true
                        break
                    default : 
                        if(isLetter(event.key)){
                            this.type(event.key)
                        }
                        break
                }
            })
        
            document.addEventListener('keyup',(event) =>{
                switch(event.key){
                    case 'ArrowRight' :
                        this.movingRight = false
                        break
                    case 'ArrowLeft' :
                        this.movingLeft = false
                        break
                    case 'ArrowUp' :
                        this.movingUp = false
                        break
                    case 'ArrowDown' :
                        this.movingDown = false
                        break
                }
            })
        }
        reset(){
            this.text = ''
            this.activeWord = 'start'
            this.prompt = 'start'
            this.recover = false
            this.lives = 3
            this.incantation = purgeString(loremIpsum)
            document.querySelector('#healthBar').innerHTML = ''
            for(let i = 0 ; i < this.lives ; i++){
                let img = document.createElement("img")
                img.src = "health.png"
                document.querySelector('#healthBar').appendChild(img)
            }
        }
        direction(){
            if(this.movingUp) return 'Up'
            if(this.movingDown) return 'Down'
            if(this.movingRight) return 'Right'
            if(this.movingLeft) return 'Left'
            return 'Idle'
        }
        draw(){
            let frequency = 100
            if (! this.recover || Math.floor(Date.now() / frequency) % 2) {  
                this.avatar.draw(this.direction(),this.x,this.y)
            }

            const args = [
                { text: `${this.text.toLowerCase()}` },
                { text: `${this.prompt.charAt(0).toUpperCase() + this.prompt.slice(1)}`, fillStyle: 'blue' }
            ]
            
            fillMixedText(ctx, args, this.x, this.y)
        }
        isMovingDiagonal(){
            let directionCount = 0
            if(this.movingUp) directionCount++
            if(this.movingDown) directionCount++
            if(this.movingLeft) directionCount++
            if(this.movingRight) directionCount++
            if(directionCount>1){
                return true
            }
            return false
        }
        move(){
            let currentSpeed = this.speed
            if(this.isMovingDiagonal())
                currentSpeed = currentSpeed/2 * 1.41
    
            if(this.movingLeft){
                this.x -= currentSpeed
                if(this.x<0) this.x = 0
            }
            if(this.movingRight){
                this.x += currentSpeed
                if(this.x > canvasWidth - this.width) this.x = canvasWidth - this.width
            }
            if(this.movingUp){
                this.y -= currentSpeed
                if(this.y < 0) this.y = 0
            }
            if(this.movingDown){
                this.y += currentSpeed
                if(this.y > canvasHeight - this.height) this.y = canvasHeight - this.height
            }
        }
        hit(){
            if(!this.recover){
                this.recover = true
                this.lives--
                document.querySelector('#healthBar img:last-child').remove()
                if(this.lives<=0){
                    this.dead()
                }
                setTimeout(()=>{
                    this.recover = false
                },1000)
            }
        }
        dead(){
            endGame()
        }
        type(char){
            if(char===this.prompt.charAt(0) || char.toUpperCase() === this.prompt.charAt(0) || char.toLowerCase() === this.prompt.charAt(0)){
                this.text+=this.prompt.charAt(0)
                this.prompt=this.prompt.substring(1)
            }
            if(this.prompt==='' ){
                if(!gameStarted && this.activeWord==='start' && this.text==='start'){
                    startGame()
                }else{
                    this.wordTyped()
                }
                if(gameStarted){
                    this.text=''
                    if(this.incantation.length===0){
                        this.cast()
                        this.incantation = purgeString(loremIpsum)
                    }else{
                        this.prompt = this.incantation[0]
                        this.incantation.shift()
                    }
                }
            }
        }

        cast(){
            document.dispatchEvent(spellCast)
        }
        wordTyped(){
            mobs.forEach((item)=>{
                item.hit()
            })
        }
    }
    
    let mainChar = new Character()

    class Projectile{
        constructor(x,y,deg,speed){
            this.x = x
            this.y = y
            this.speed = speed
            this.deg = deg
        }
        move(){
            let rads = this.deg * Math.PI / 180
            let vx = Math.cos(rads)*this.speed
            let vy = Math.sin(rads)*this.speed
            this.x += vx
            this.y += vy
            return this.x > canvasWidth || this.y > canvasHeight || this.x < 0 || this.y < 0
        }
        draw(){
            ctx.beginPath()
            ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI)
            ctx.stroke()
        }
        collides(char){
            if(char.x+8 < this.x && this.x < char.x-8 + char.width && char.y+8 < this.y && this.y < char.y-8 + char.height){
                char.hit()
                return true
            }else{
                return false
            }
        }
    }

    class Foe{
        constructor(){
            mobs.push(this)
            this.difficulty = gameDifficulty
            this.health = 100
            this.numColumns = 8
            this.currentFrame = 0 
            this.direction = 0
            this.x = 50
            this.y = 50
            this.speed = 2
            this.avatar = new Image()
            this.height = 32
            this.width = 32
            this.projectiles = []
            this.avatar.onload = () => {}
            this.avatar.src = 'glaringoverlord.png'
            this.frenzy = true
        }

        death(){//a retoucher si ya plusieurs mobs
            clearInterval(this.attackID)
            clearInterval(this.frenzyID)
            this.speed = 0
            setTimeout(()=>{
                if(gameStarted){
                    mobs.pop()
                    if(mobs.length===0){
                        console.log('extermination')
                        endGame()
                    }
                }
            },4000)
        }

        hit(){
            this.health -= 15
            if(this.health<=0){
                this.health=0
                this.death()
            }
        }

        draw(){
            this.currentFrame++
            let maxFrame = this.numColumns - 1
            if (this.currentFrame > maxFrame){
                this.currentFrame = 0
            }
            let column = this.currentFrame % this.numColumns;


            let frequency = 100
            if ( this.health || Math.floor(Date.now() / frequency) % 2) {  
                ctx.drawImage(this.avatar, column * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height)
            }


            ctx.fillStyle = "red";
            ctx.fillRect(this.x, this.y-5, (this.width/100)*this.health, 3);
        
            this.projectiles.forEach((item)=>{
                item.draw()
            })
        }

        collides(char){
            this.projectiles.forEach((item,index)=>{
                if(item.collides(char)){
                    if(gameStarted)
                        char.hit()
                    this.projectiles.splice(index,1)
                }
            })
            if(char.x + char.width -8  >= this.x && char.x +8 <= this.x+this.width && char.y +8<= this.y + this.height && char.y + char.height -8 >= this.y){
                char.hit()
                return true
            }else{
                return false
            }
        }

        attack(deg,speed){
            this.projectiles.push(new Projectile(this.x+this.width/2,this.y+this.height/2,deg,speed))
        }

        circleAttack(nbProj, startAngle){
            for(let i = 1; i <= nbProj; i++){
               this.attack(Math.floor(startAngle+360*i/nbProj), 2)
            }
        }

        arcAttack(nbProj, startAngle, spreadAngle){
            if(startAngle==='inverse'){
                 startAngle = this.pointToAngle(mainChar.x,mainChar.y)+spreadAngle/2
                 spreadAngle = 360 - spreadAngle
            }
            if(startAngle==='auto') startAngle = this.pointToAngle(mainChar.x,mainChar.y)-spreadAngle/2
            for(let i = 1; i <= nbProj; i++){
                this.attack(Math.floor(startAngle+spreadAngle*i/nbProj), 5)
             }
        }

        shotgunAttack(nbProj, startAngle, spread){
            if(startAngle==='auto') startAngle = this.pointToAngle(mainChar.x,mainChar.y)
            for(let i = 0; i<nbProj; i++){
                this.attack( startAngle + Math.floor(Math.random()*spread - spread/2) , Math.random()*4+1)
            }
        }

        flameThrower(nbProj, startAngle, spread, atkFreq, frenzyFreq){
            this.attackID = setInterval(()=>{
                if(this.frenzy){
                    this.shotgunAttack(nbProj, startAngle, spread)
                }
            },atkFreq)

            this.frenzyID = setInterval(()=>{
                this.frenzy = !this.frenzy
            },frenzyFreq)
        }

        randomAttack(nbProj, startAngle, spread, atkFreq){
            this.attackID = setInterval(()=>{
                if(Math.random() < 0.5){
                    this.circleAttack( Math.floor(Math.random() * 30), Math.floor(Math.random() * 360))
                }else{
                    this.shotgunAttack(10,Math.floor(Math.random()*360),20)
                }
            },atkFreq)
        }

        moveProjectiles(){
            this.projectiles.forEach((item,index)=>{
                if(item.move()){
                    this.projectiles.splice(index,1)
                }
            })
        }

        move(){
            let rads = this.direction * Math.PI / 180
            let vx = Math.cos(rads)*this.speed
            let vy = Math.sin(rads)*this.speed
            this.x += vx
            this.y += vy
            if(this.x < 0){
                this.x = 0
                this.direction = Math.floor(Math.random() * 360)
            }else if(this.x + this.width > canvasWidth){  
                this.x = canvasWidth - this.width
                this.direction = Math.floor(Math.random() * 360)
            }
            if(this.y < 0){
                this.y = 0
                this.direction = Math.floor(Math.random() * 360)
            }else if(this.y + this.height > canvasHeight){
                this.y = canvasHeight - this.height
                this.direction = Math.floor(Math.random() * 360)
            }
        }

        pointToAngle(x,y){
            let deltaX = x - this.x
            let deltaY = this.y - y
            let result = Math.floor(Math.atan2(deltaY, deltaX)*(180/Math.PI))
            return (result < 0) ? -result : (360 - result)
        }

        animate(atkFreq){
            if(this.difficulty==='hard'){
                this.flameThrower(20, 'auto', 20, 50, 2200)
            }else{
                this.randomAttack(20, Math.floor(Math.random()*360), 20, atkFreq, 2000)
            }
        }
    }

    function fillMixedText(ctx, args, x, y){//recup
        let defaultFillStyle = ctx.fillStyle
        let defaultFont = ctx.font
      
        ctx.save()
        args.forEach(({ text, fillStyle, font }) => {
          ctx.fillStyle = fillStyle || defaultFillStyle
          ctx.font = font || defaultFont
          ctx.fillText(text, x, y)
          x += ctx.measureText(text).width
        })
        ctx.restore()
    }

    function purgeString(string){
        let newString = string.replaceAll(',','')
        newString = newString.replaceAll('.','')
        newString = newString.split(' ')
        return newString
    }

    function isLetter(c) {
        if(c.length>1)
            return false
        return c.toLowerCase() != c.toUpperCase()
    }

    function render(){
        ctx.clearRect(0, 0, canvasWidth, canvasHeight)
        if(!gameStarted){
            ctx.save()
            ctx.beginPath()
            ctx.setLineDash([20, 20])
            ctx.lineDashOffset = Math.floor(Date.now() / 20) % 40
            ctx.moveTo(canvasWidth/2, 0)
            ctx.lineTo(canvasWidth/2, canvasHeight)
            ctx.stroke()
            ctx.fillStyle = 'black'
            ctx.font = '48px serif'
            ctx.fillText('EZ', 10,  48)
            ctx.fillText('VNR', canvasWidth-110, canvasHeight-10)
            ctx.restore()
        }
        if(mainChar){
            mainChar.move()
            mainChar.draw()
        }
        if(badGuy){
            badGuy.draw()
            badGuy.move()
            badGuy.moveProjectiles()
            badGuy.collides(mainChar)
        }
        requestAnimationFrame(render)
    }

    function endGame(){
        badGuy=false
        mainChar.reset()
        gameStarted = false
    }

    function startGame(){
        mainChar.x>canvasWidth/2 ? gameDifficulty = 'hard' : gameDifficulty = 'easy'
        gameStarted = true
        badGuy = new Foe()
        mainChar.reset()
        setTimeout(() => {
            badGuy.animate(1000)
        }, 100)
    }

    let badGuy = false

    requestAnimationFrame(render)

  }