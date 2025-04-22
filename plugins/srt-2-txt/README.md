# Milestone Highlights

## Script Overview

The **Milestone Highlights** plugin is a JavaScript-based web tool that calculates and displays special milestone dates based on a user-defined anniversary. By combining monthly anniversaries with milestone intervals (in days), this plugin identifies and highlights dates when both criteria align. The tool is helpful for tracking and celebrating significant recurring moments such as work anniversaries, relationship milestones, or project progress.

## Detailed Use/Features

1. **Date Input**: Users provide an initial anniversary date as the starting point.
2. **Milestone Interval**: Users input a milestone interval (in days) to evaluate recurring significant milestones.
3. **Evaluation Period**: Users specify the number of years over which the milestones should be computed.
4. **Calculation Logic**:
   - Generates monthly anniversaries over the specified time span.
   - Computes milestone dates by repeatedly adding the milestone interval to the anniversary date.
   - Identifies and highlights dates that are both monthly anniversaries and milestone intervals.
5. **Interactive UI**: Features a user-friendly interface using Bootstrap components.
6. **Toast Notifications**: Custom toast messages are shown for actions such as initialization, errors, and results using icon-coded alerts.

## Requirements

- A modern web browser (Chrome, Firefox, Edge, Safari)
- Local or hosted web server (if accessing via file path restrictions)
- Internet connection (if external libraries like Bootstrap or Font Awesome are CDN-based)

## Usage

1. Open the plugin interface in your browser.
2. Enter:
   - An **Anniversary Date**
   - A **Milestone Interval** (e.g., 100 days)
   - A **Number of Years** to evaluate (e.g., 5)
3. Click **Calculate**.
4. View the output section for matched milestone dates where monthlyversaries align with milestone intervals.

## Disclaimer

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF, OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Additionally, the code presented here has been generated with the assistance of AI and may contain errors or require adjustments for specific use cases. This script has only been tested on Windows 11, and its compatibility with other operating systems is not guaranteed. Users are advised to back up their data before running the script to prevent any accidental loss of files.
