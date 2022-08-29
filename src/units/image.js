import { HSL2RGB, isLightColor, RGB2HSL } from './color'
import { NFTStorage } from 'nft.storage/dist/bundle.esm.min.js'
import { BigNumber, ethers } from 'ethers'
import contractJson from '../contract.json'

const NFT_STORAGE_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDk4YjFDRUJDMDc5Mzk4NWNGNzM2NzNiNDI1MTVlOTQ0NzM4MmM3RGYiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1OTYzMTE2MTcyMSwibmFtZSI6InNhZiJ9.vQiFuB9ioSXaetLG0HjcNuR0zDYdldf9sySVjMCQSws'
const client = new NFTStorage({ token: NFT_STORAGE_TOKEN })

/**
 * 图片亮度、饱和度、对比度吊装
 * @param {Element} el
 * @param {Object} options width,height,h,s,c percent
 */
export function adjust (el, options) {
  return new Promise(resolve => {
    const canvasOrigin = document.createElement('canvas')
    const contextOrigin = canvasOrigin.getContext('2d')
    canvasOrigin.width = el.naturalWidth
    canvasOrigin.height = el.naturalHeight
    contextOrigin.drawImage(el, 0, 0)
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const {
      width,
      height
    } = options
    canvas.width = width
    canvas.height = height
    context.drawImage(
      canvasOrigin,
      0,
      0,
      canvasOrigin.width,
      canvasOrigin.height,
      0,
      0,
      width,
      height
    )
    const imgPixels = context.getImageData(0, 0, width, height)
    let sum = 0
    for (let y = 0; y < imgPixels.height; y++) {
      for (let x = 0; x < imgPixels.width; x++) {
        const i = y * 4 * imgPixels.width + x * 4
        const R = imgPixels.data[i]
        const G = imgPixels.data[i + 1]
        const B = imgPixels.data[i + 2]
        const hsl = RGB2HSL(R, G, B)
        // 对比度
        if (options.c) {
          // 求和
          sum += R + G + B
        }
        if (options.s || options.l) {
          // 饱和度
          if (options.s) {
            options.s = Math.max(options.s, -1)
            options.s = Math.min(options.s, 1)
            hsl[1] *= (1 + options.s)
          }
          // 亮度
          if (options.l) {
            options.l = Math.max(options.l, -1)
            options.l = Math.min(options.l, 1)
            hsl[2] *= (1 + options.l)
          }
          const newRGB = HSL2RGB(...hsl)
          imgPixels.data[i] = newRGB[0]
          imgPixels.data[i + 1] = newRGB[1]
          imgPixels.data[i + 2] = newRGB[2]
        }
      }
    }
    if (options.c) {
      options.c = Math.max(options.c, -1)
      options.c = Math.min(options.c, 1)
      const avg = sum / imgPixels.data.length
      for (let y = 0; y < imgPixels.height; y++) {
        for (let x = 0; x < imgPixels.width; x++) {
          const i = y * 4 * imgPixels.width + x * 4
          const R = imgPixels.data[i]
          const G = imgPixels.data[i + 1]
          const B = imgPixels.data[i + 2]
          if (options.c < 0) {
            if (options.c === -1) {
              const c = Math.round(avg)
              imgPixels.data[i] = c
              imgPixels.data[i + 1] = c
              imgPixels.data[i + 2] = c
            } else {
              imgPixels.data[i] = Math.round(R + (R - avg) * options.c)
              imgPixels.data[i + 1] = Math.round(G + (G - avg) * options.c)
              imgPixels.data[i + 2] = Math.round(B + (B - avg) * options.c)
            }
          } else {
            const c = 255 * 255 / (255 - 255 * options.c) - 255
            imgPixels.data[i] = Math.round(R + (R - avg) * c / 255)
            imgPixels.data[i + 1] = Math.round(G + (G - avg) * c / 255)
            imgPixels.data[i + 2] = Math.round(B + (B - avg) * c / 255)
          }
        }
      }
    }
    context.putImageData(imgPixels, 0, 0, 0, 0, width, height)
    canvas.toBlob(blob => resolve(blob))
  })
}
export  function download (options)  {
  return new Promise(async (resolve) => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = options.pixelW
    canvas.height = options.pixelH
    context.drawImage(options.el, 0, 0, options.pixelW, options.pixelH)

    const canvasCopy = document.createElement('canvas')
    const contextCopy = canvasCopy.getContext('2d')

    canvasCopy.width = canvas.width
    canvasCopy.height = canvas.height
    contextCopy.drawImage(canvas, 0, 0)
    const ratio = 32
    canvas.width = canvas.width * ratio
    canvas.height = canvas.height * ratio
    context.mozImageSmoothingEnabled = false
    context.webkitImageSmoothingEnabled = false
    context.imageSmoothingEnabled = false
    context.drawImage(
      canvasCopy,
      0,
      0,
      canvasCopy.width,
      canvasCopy.height,
      0,
      0,
      canvas.width,
      canvas.height
    )
    if (options.havePalette) {
      if (options.drawLine) {
        const w = canvas.width
        const h = canvas.height
        const unit = canvas.width / options.pixelW
        var imgPixels = context.getImageData(0, 0, w, h)
        context.strokeStyle = 'black'
        context.lineWidth = 1
        for (var y = unit; y < imgPixels.height; y += unit) {
          context.beginPath()
          context.moveTo(0, y)
          context.lineTo(w, y)
          context.stroke()
        }
        for (var x = unit; x < imgPixels.width; x += unit) {
          context.beginPath()
          context.moveTo(x, 0)
          context.lineTo(x, h)
          context.stroke()
        }
      }
      if (options.fillNums) {
        const containColorKeys = Object.keys(options.paletteMap)
        if (containColorKeys.length > 0) {
          const colors = options.palette.filter(c => containColorKeys.includes(c.join(',')))
          const unit = canvas.width / options.pixelW
          context.font = `${Math.round(unit * 0.8)}px sans-serif`
          context.textBaseline = 'middle'
          context.textAlign = 'center'
          const offset = 1
          for (let i = 0; i < colors.length; i++) {
            const c = colors[i]
            const k = c.join(',')
            context.fillStyle = isLightColor(c[0], c[1], c[2]) ? '#000' : '#fff'
            for (let j = 0; j < options.paletteMap[k].length; j++) {
              const x = options.paletteMap[k][j] % options.pixelW
              const y = Math.floor(options.paletteMap[k][j] / options.pixelW)
              context.fillText(`${i + 1}`, x * unit + unit / 2, y * unit + unit / 2 + offset, unit)
            }
          }
        }
      }
    }

    canvasCopy.width = canvas.width
    canvasCopy.height = canvas.height
    contextCopy.drawImage(canvas, 0, 0)
    const width = canvas.width
    const height = canvas.height
    const padding = 1
    canvas.width = width + 2 * padding
    canvas.height = height + 2 * padding
    // const containColorKeys = Object.keys(options.paletteMap)
    // const rectW = 3.5 * ratio
    // const rectH = 3.5 * ratio
    // const rectM = 2 * ratio
    // const maxCols = Math.floor((width + rectM) / (rectW + rectM))
    // const cols = Math.min(maxCols, containColorKeys.length)
    // const rows = Math.ceil(containColorKeys.length / maxCols)
    if (options.havePalette) {
      //  canvas.height = canvas.height + (rows * rectH) + (rows - 1) * rectM + padding
    }
    context.mozImageSmoothingEnabled = false
    context.webkitImageSmoothingEnabled = false
    context.imageSmoothingEnabled = false
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(
      canvasCopy,
      0,
      0,
      canvasCopy.width,
      canvasCopy.height,
      padding, // options.x,
      padding, // options.y,
      width,
      height
    )
    const link = document.createElement('a')
    link.download = 'pixel-art.png'

    // The MetaMask plugin also allows signing transactions to
    // send ether and pay to change state within the blockchain.
    // For this, you need the account signer...
    const { ethereum } = window
    if (!ethereum) {
      console.log("metamask don't installed")
      return
    }
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    const connectedContract = new ethers.Contract(
      '0xC79e9746DC6A2F84Dd57193606A7C21167732c65',
      contractJson.abi,
      signer
    )
    const currentIndex = await connectedContract.currentIndex()
    const currentIndexNum = BigNumber.from(currentIndex).toNumber() + 1
    console.log(currentIndexNum)

    const imageData = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream')
    link.href = imageData

    const blob = dataURItoBlob(imageData)
    // const metadata = await client.storeBlob(blob)
    const metadata = await client.store({
      name: 'Metaverse inhabitants #' + currentIndexNum,
      description: 'This is the ' + currentIndexNum + ' inhabitant of our Metaverse, welcome to join us!',
      image: blob
    })
    console.log(metadata)

    const accounts = await ethereum.request({
      method: 'eth_requestAccounts'
    })
    console.log(accounts)

    const mintTxn = await connectedContract.mintToken(
      accounts[0],
      metadata.ipnft + '/metadata.json'
    )

    const rc = await mintTxn.wait()
    const sumEvent = rc.events[1]
    console.log(rc)
    const sum = sumEvent.args[0]
    const num = BigNumber.from(sum).toNumber()
    console.log(num)
    const url = 'https://testnets.opensea.io/assets/mumbai/0xC79e9746DC6A2F84Dd57193606A7C21167732c65/' + num
    window.open(url, '_blank')
    resolve()
  })
}

function dataURItoBlob (dataURI) {
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1])

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length)

  // create a view into the buffer
  var ia = new Uint8Array(ab)

  // set the bytes of the buffer to the correct values
  for (var i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }

  // write the ArrayBuffer to a blob, and you're done
  var blob = new Blob([ab], { type: mimeString })
  return blob
}
