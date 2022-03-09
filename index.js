window.onload = () => {
    const canvas = document.getElementById('canvas')
    const canvasHeight = canvas.height
    const canvasWidth = canvas.width
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    ctx.font = '16px Aerial'
    //ctx.textAlign = 'center' //ça éclate le fillMixedText 

    let incantation = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque porttitor, quam id finibus euismod, purus quam luctus magna, convallis sollicitudin velit erat id arcu.'
    incantation = incantation.replaceAll(',','')
    incantation = incantation.replaceAll('.','')
    incantation = incantation.split(' ')

    class Character{
        constructor(){
            this.y = 0
            this.x = 0
            this.movingUp = false
            this.movingDown = false
            this.movingRight = false
            this.movingLeft = false
            this.speed = 4
            this.text = ''
            this.prompt = incantation[0]
            incantation.shift()
            this.avatar = new Image()
            this.height = 23
            this.width = 14
            this.recover = false
            this.lives = 3

            this.avatar.onload = () => {
              ctx.drawImage(this.avatar, this.x, this.y, this.width, this.height);
            }

            this.avatar.src = 'Toad.png';

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
        move(){//à changer pour prendre en compte la taille du char
            let currentSpeed = this.speed
            if(this.isMovingDiagonal())
                currentSpeed = currentSpeed/2 * 1.41
    
            if(this.movingLeft && this.x > 9)
            this.x -= currentSpeed
    
            if(this.movingRight && this.x < canvasWidth - 22)
            this.x += currentSpeed
    
            if(this.movingUp && this.y > 9)
            this.y -= currentSpeed
    
            if(this.movingDown && this.y < canvasHeight - 33)
            this.y += currentSpeed

        }
        draw(){
            let frequency = 100
            if (! this.recover || Math.floor(Date.now() / frequency) % 2) {  
                ctx.drawImage(this.avatar, this.x, this.y, this.width, this.height)
            }
            //ctx.strokeText(this.prompt, this.x+(this.width/2) , this.y-5)

            const args = [
                { text: `${this.text}` },
                { text: `${this.prompt}`, fillStyle: 'blue' }
              ]
              
            fillMixedText(ctx, args, this.x, this.y-5)
        }
        hit(){
            if(!this.recover){
                this.recover = true
                this.lives--
                document.querySelector('#healthBar img:last-child').remove()
                if(this.lives<1){
                    this.dead()
                }
                setTimeout(()=>{
                    this.recover = false
                },1000)
            }
        }
        dead(){
            alert("GAME OVER");
            document.location.reload();
        }
        type(char){
            if(char===this.prompt.charAt(0) || char.toUpperCase() === this.prompt.charAt(0)){
                this.text+=this.prompt.charAt(0)
                this.prompt=this.prompt.substring(1)
            }
            if(this.prompt===''){
                this.text=''
                if(incantation.length===0){
                    this.cast()
                }else{
                    this.prompt = incantation[0]
                    incantation.shift()
                }
            }
        }
        cast(){
            console.log('BRLRLRLA')
        }
    }

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
            if(char.x < this.x && this.x < char.x + char.width && char.y < this.y && this.y < char.y + char.height){
                char.hit()
                return true
            }else{
                return false
            }
        }
    }

    class Foe{
        constructor(){
            this.direction = 0
            this.x = 350
            this.y = 350
            this.speed = 2
            this.avatar = new Image()
            this.height = 23
            this.width = 14
            this.projectiles = []
            this.avatar.onload = () => {
              ctx.drawImage(this.avatar, this.x, this.y, this.width, this.height)
            }
            this.avatar.src = 'Toad.png'
        }

        draw(){
            ctx.drawImage(this.avatar, this.x, this.y, this.width, this.height)
            this.projectiles.forEach((item)=>{
                item.draw()
            })
        }

        collides(char){
            this.projectiles.forEach((item,index)=>{
                if(item.collides(char)){
                    char.hit()
                    this.projectiles.splice(index,1)
                }
            })
            if(char.x + char.width >= this.x && char.x <= this.x+this.width && char.y <= this.y + this.height && char.y + char.height >= this.y){
                char.hit()
                return true
            }else{
                return false
            }
        }

        attack(deg,speed){
            this.projectiles.push(new Projectile(this.x,this.y,deg,speed))
        }

        circleAttack(nbProj, startAngle){
            for(let i = 1; i <= nbProj; i++){
               this.attack(Math.floor(startAngle+360*i/nbProj), 2)
            }
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
            }
            if(this.y < 0){
                this.y = 0
                this.direction = Math.floor(Math.random() * 360)
            }
            if(this.x + this.width > canvasWidth){
                 this.x = canvasWidth - this.width
                 this.direction = Math.floor(Math.random() * 360)
            }
            if(this.y + this.height > canvasHeight){
                 this.y = canvasHeight - this.height
                 this.direction = Math.floor(Math.random() * 360)
            }
        }
    }

    const fillMixedText = (ctx, args, x, y) => {
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

    function isLetter(c) {
        if(c.length>1)
            return false
        return c.toLowerCase() != c.toUpperCase()
    }

    function render(){
        ctx.clearRect(0, 0, canvasWidth, canvasHeight)
        toad.draw()
        badGuy.draw()
        badGuy.move()
        badGuy.moveProjectiles()
        badGuy.collides(toad)
    }

    let toad = new Character()
    let badGuy = new Foe()
    badGuy.circleAttack(10,20)

    setInterval(function(){
        toad.move()
        render()
    },20)

    setInterval(function(){
        badGuy.circleAttack( Math.floor(Math.random() * 30), Math.floor(Math.random() * 360))
    },1000)

  }