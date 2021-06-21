# Github 

1. To get Contribution 
let contribution = document.querySelector('.js-yearly-contributions h2')
2. Getting Top Repositories
(As there can be forked repos also, and we dont have to include them, we will filter them out )
let allPersonalRepo = document.querySelectorAll('#user-repositories-list li.source')

Next step is to scrap leetcode details 

# Leetcode 
- Total Submmissions -> .ant-card-head-title (5th)
- Total Questions Solved -> div.total-solved-count__2El1
- Easy-Medium-Hard -> span.difficulty-ac-count__jhZm
- Contest Attended -> .css-x9b7oa (2nd)
- Code Acceptance -> .css-1b3bb7o-PercentNumber

# Codechef 
- Codechef Stars -> .rating-star (childrens count )  document.querySelector('.rating-star').childElementCount
- Rating -> document.querySelector('.rating-number').innerText
- Problems Solved -> solved = document.querySelector('.rating-data-section .content h5').innerText.split(" ")[2];
                    solved.slice(1,-1);