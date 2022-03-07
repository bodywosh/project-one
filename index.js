window.onload = () => {
    const canvas = document.getElementById('canvas')
    const canvasHeight = canvas.height
    const canvasWidth = canvas.width
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false
    ctx.textAlign = 'center'

    class Character{
        constructor(){
            this.y = 0
            this.x = 0
            this.movingUp = false
            this.movingDown = false
            this.movingRight = false
            this.movingLeft = false
            this.speed = 5
            this.text = ''
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
                            this.text += event.key
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
            ctx.drawImage(this.avatar, this.x, this.y, this.width, this.height)
            ctx.strokeText(this.text, this.x+(this.width/2) , this.y-5)
        }
        hit(){
            if(!this.recover){
                this.recover = true
                this.lives--
                if(this.lives<1){
                    this.dead()
                }
                setTimeout(()=>{
                    this.recover = false
                },1000)
            }
        }
        dead(){
            console.log("ded")
        }
    }

    class Projectile{
        constructor(x,y,deg,speed){
            this.x = x
            this.y = y
            this.speed = speed
            this.deg = deg
        }
        move(){//il faut détruire le projectile s'il sort de l'écran
            let rads = this.deg * Math.PI / 180
            let vx = Math.cos(rads)*this.speed
            let vy = Math.sin(rads)*this.speed
            this.x += vx
            this.y += vy
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
            this.y = 350
            this.x = 350
            this.speed = 5
            this.avatar = new Image()
            this.height = 23
            this.width = 14

            this.avatar.onload = () => {
              ctx.drawImage(this.avatar, this.x, this.y, this.width, this.height)
            }

            this.avatar.src = 'Toad.png'
        }
        draw(){
            ctx.drawImage(this.avatar, this.x, this.y, this.width, this.height)
        }
        collides(char){
            if(char.x + char.width >= this.x && char.x <= this.x+this.width && char.y <= this.y + this.height && char.y + char.height >= this.y){
                char.hit()
                return true
            }else{
                return false
            }
        }
    }

    let toad = new Character()
    let bullet = new Projectile(200,200,0,1)
    let badGuy = new Foe()

    function render(){
        ctx.clearRect(0, 0, canvasWidth, canvasHeight)
        toad.draw()
        bullet.move()
        bullet.draw()
        badGuy.draw()
        badGuy.collides(toad)
    }

    function isLetter(c) {
        if(c.length>1)
            return false
        return c.toLowerCase() != c.toUpperCase();
      }


    setInterval(function(){
        toad.move()
        render()
    },20)


  };