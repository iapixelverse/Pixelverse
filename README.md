# PixelMetaverse

Upload an image and convert it to pixel art.

# References

## color space conversion
https://github.com/brehaut/color-js  

## Brightness and saturation adjustment
https://github.com/chenshenhai/pictool

## Color Difference Algorithm
https://zh.wikipedia.org/wiki/%E9%A2%9C%E8%89%B2%E5%B7%AE%E5%BC%82#CIEDE2000  
https://github.com/kenlimmj/empfindung  
https://github.com/Evercoder/d3-color-difference  
https://github.com/gfiumara/CIEDE2000  

## The principle of contrast (from the Internet)

```text
Photoshop contrast algorithm. It can be represented by the following formula:

(1)nRGB = RGB + (RGB - Threshold) * Contrast / 255
In the formula, nRGB represents the new R, G, and B components of the image pixel, 
RGB represents the R, G, and B components of the image pixel, Threshold is the given threshold, 
and Contrast is the processed contrast increment.

Photoshop handles the contrast increment according to the positive and negative of the given value:

When the increment is equal to -255, it is the lower limit of the image contrast. At this time, 
the RGB components of the image are all equal to the threshold value, the image is completely gray, 
and there is only one line on the grayscale image, that is, the threshold grayscale;

When the increment is greater than -255 and less than 0, directly use the above formula to calculate each component of the image pixel;

When the increment is equal to 255, it is the upper limit of the image contrast, which is actually equal to setting the image threshold. 
The image consists of up to eight colors, and there are up to eight lines on the grayscale image, namely red, yellow, green, cyan, blue,
and purple. and black and white;

When the increment is greater than 0 and less than 255, the increment is first processed according to the following formula (2), 
and then the contrast is calculated according to the above formula (1):

(2), nContrast = 255 * 255 / (255 - Contrast) - 255

nContrast in the formula is the processed contrast increment, and Contrast is the given contrast increment.
```





