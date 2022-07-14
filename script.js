const mealsEl = document.getElementById("meals");
const favoriteContainer = document.getElementById("fav-meals");
const mealPopup = document.getElementById('meal-popup');
const mealInfoEl = document.getElementById('meal-info');
const popupClosebtn = document.getElementById('close-popup')

getRandomModel();
fetchFavMeals();

const searchTerm = document.getElementById('search-term');
const searchBtn = document.getElementById('search');

//랜덤 음식 이미지 api
async function getRandomModel() {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );
  //single random meal
  const respData = await resp.json();

  const randomMeal = respData.meals[0];
  addMeal(randomMeal, true);
}


//meal 검색 api
async function getMealById(id) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
  );
  //meal all detail id
  const respData = await resp.json();

  const meals = respData.meals[0];

  return meals;
}


//meal 음식명 검색 api
async function getMealBySearch(term) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
  );

  const respData = await resp.json();

  const meals = respData.meals;

  return meals
}


function addMeal(mealData, random = false) {
  const meal = document.createElement("div");
  meal.classList.add("meal");
  meal.innerHTML = `<div class="meal-header"> 
    ${random ? `<span class="random">랜덤 이미지</span>` : ""}
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    </div>
    <div class="meal-body">
        <h4>${mealData.strMeal}</h4>
        <button class="fav-btn"><i class="fas fa-heart"></i></button>
    </>
</div> `;


  const btn = meal.querySelector(".meal-body .fav-btn");

  btn.addEventListener("click", () => {
    if (btn.classList.contains("active")) {
      removeMealLS(mealData.idMeal);

      btn.classList.remove("active");
    } else {
      addMealLS(mealData.idMeal);
      btn.classList.add("active");
    } 

    fetchFavMeals();
  });

  meal.addEventListener('click', () => {
    btn.addEventListener('click', (event) =>{
      event.stopPropagation()
    })
      showMealInfo(mealData);
  })

  mealsEl.appendChild(meal);
}

function addMealLS(mealId) {
  const mealIds = getMealsLS();
  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealLS(mealId) {
  const mealIds = getMealsLS();

  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter(id => id !== mealId))
  );
}

function getMealsLS() {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
    favoriteContainer.innerHTML = "";
    const mealIds = getMealsLS();

      if(mealIds ==! null){
        const mealId = mealIds 
        
        addMealToFav()
      }
        for(let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
    
        meal = await getMealById(mealId);
    
        addMealToFav(meal);
        }
    }
  

async function addMealToFav(mealData) {
    //clean the container
    const favMeal = document.createElement("li");
  
   favMeal.innerHTML = `<img src="${mealData.strMealThumb}" alt="${mealData.strMeal}"/><span>${mealData.strMeal}</span>
                            <button class="clear"><i class="fas fa-window-close"></i></button>`;
   
    const btn = favMeal.querySelector(".clear");

    btn.addEventListener("click", () => {
        removeMealLS(mealData.idMeal);
        btn.classList.add("active");
        fetchFavMeals();
    });
    favMeal.addEventListener("click", () => {
      if(btn.classList.contains("active")){
        return null
      }else{
        showMealInfo(mealData);
      }
    });

    favoriteContainer.appendChild(favMeal);
  }

  function showMealInfo(mealData) {

    mealInfoEl.innerHTML = "";
    //update the Meal info
      const mealEl = document.createElement('div');
      const ingredients = []; 
      for(let i=1; i<=20; i++){
  
        if(mealData["strIngredient"+i]){ 
          ingredients.push(`${mealData["strIngredient"+i]} - ${mealData["strMeasure"+i]}`);
        }else{
          break;
        }
      }
    
      mealEl.innerHTML = `<h1>${mealData.strMeal}</h1>
      <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
      <p>${mealData.strInstructions}</p>
        <h3>Ingredients:</h3>
          <ul>${ingredients.map((ing) => `<li>${ing}</li>`).join("")}</ul>`;
        
      mealInfoEl.appendChild(mealEl);
 
      
      //show the popup
      mealPopup.classList.remove("hidden");
  }

  function showNotSearch(){
    const errSerch = document.createElement('div');
    errSerch.classList.add("error")
    errSerch.innerHTML = `<h1>정보를 찾을수 없습니다</h1>`
    mealsEl.appendChild(errSerch);
  }
  
searchBtn.addEventListener('click', async () => {
    
    mealsEl.innerHTML = '';

    const search = searchTerm.value;

    const meals = await getMealBySearch(search);

    if(meals){
      meals.forEach(meal => {
        addMeal(meal)
      })
    }else{
      showNotSearch()
    }
  

})

popupClosebtn.addEventListener('click', async () => {
  mealPopup.classList.add('hidden');
})