# Simple website testing tool
This app lets you visually test static website for any changes. If you have a huge website, where you want to make sure that after you make changes, nothing bad happens? Then this is the tool for you.

## How it works
You can enter websites **sitemap** containing all pages, or create **array** of urls you want to test.

When app starts, puppeteer will go to each page and take a full page screenshot, mobile or pc, you can configure it in the _config.json_ file. Then taken screenshots are compared to the old screenshots of the website, and outputs two files for each url. 
1. Overylay image, where two images are overlayed
2. Difference image, where it marks with red differences that appeared in either of screenshots, it's useful if the change is small and barely visible

### The app needs to be ran twice, before and after changes happen

# Examples
### This is our page
![desktop_localhost_diff_](https://github.com/user-attachments/assets/ad5888e9-0cab-4834-8d2d-d434a1492474)

After changing css from
```css
.container {
    max-width: 820px;
    margin: auto;
    padding: 24px;
    background: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
}
```

To
```css
.container {
    max-width: 818px;
    margin: auto;
    padding: 24px;
    background: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.25);
}
```

And running the testing app, we can see overlayed and difference image
![overlay_desktop_localhost_diff_](https://github.com/user-attachments/assets/1f0d1c5a-57bc-4e1a-b9c3-205b04d9024f)
![diff_desktop_localhost_diff_](https://github.com/user-attachments/assets/8a8ce4c4-9603-4557-97d5-07aeec27e78c)
