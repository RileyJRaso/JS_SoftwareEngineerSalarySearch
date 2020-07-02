//selecting the elements that are permanent
const input = document.getElementById("search-input");
const Searchlist = document.getElementById("listLeft");
const Savedlist = document.getElementById("listRight");

//Global Varables
const position = "beforeend";
var CurrentSearchedCountrydata = [];
let SavedCountrydata;
let id;


//------------------------- Startup Script -------------------------//

// get list from local storage
let localdata = localStorage.getItem("SOFTWARESALARYDATA");

if(localdata){
  SavedCountrydata = JSON.parse(localdata);
  id = SavedCountrydata.length;
  UpdateSavedCountries(SavedCountrydata)
}else{
  SavedCountrydata = [];
  id = 0;
}

//------------------------- Loading Funtions -------------------------//

function UpdateSalaryValues (CurrentSearchedCountrydata){
  CurrentSearchedCountrydata.forEach(function(Countrydata){

    SalarySearch(Countrydata[0]["Link"], function(UpdatedSalaries){
      Countrydata[0]["25th percentile"] = UpdatedSalaries["percentile_25"].toFixed(2);
      Countrydata[0]["50th percentile"] = UpdatedSalaries["percentile_50"].toFixed(2);
      Countrydata[0]["75th percentile"] = UpdatedSalaries["percentile_75"].toFixed(2);
    });

  });
};

function UpdateSavedCountries(SavedCountrydata){
  //use API to get current data
  UpdateSalaryValues(SavedCountrydata);

  //displaying all the Country Data
  var CurrentElementID = 0;
  SavedCountrydata.forEach(function(Countrydata){
    CurrentCountrydata = Countrydata[0];
    if(CurrentCountrydata["Saved"] == true){
      DisplaySavedCountry(CurrentCountrydata["CountryName"], CurrentCountrydata["25th percentile"], CurrentCountrydata["50th percentile"], CurrentCountrydata["75th percentile"], CurrentElementID);
      CurrentElementID = CurrentElementID + 1;
    }else{
      CurrentElementID = CurrentElementID + 1;
    }
  });

};

//------------------------- Saving a Country Funtions -------------------------//

function SaveCountry (){
  //getting the data of the Searched Country
  CountryName = CurrentSearchedCountrydata[0]["CountryName"];
  Salary25th = CurrentSearchedCountrydata[0]["25th percentile"];
  Salary50th = CurrentSearchedCountrydata[0]["50th percentile"];
  Salary75th = CurrentSearchedCountrydata[0]["75th percentile"];

  //changing the Saved value to true, and adding it to the Country data
  CurrentSearchedCountrydata[0]["Saved"] = true;
  SavedCountrydata.push(CurrentSearchedCountrydata);
  localStorage.setItem("SOFTWARESALARYDATA", JSON.stringify(SavedCountrydata));

  DisplaySavedCountry(CountryName, Salary25th, Salary50th, Salary75th, id);

  //increasing the id for Country entity
  id = id + 1;
};

function DisplaySavedCountry(CountryName, Salary25th, Salary50th, Salary75th, EntityID){


  //Creating the new Country entity
  const CountryEntity = `
                        <li class="itemRight">
                          <i class="fa fa-exit ex" job="Delete" id = "${EntityID}"></i>
                          <p class="Country">${CountryName}</p>
                          <p class="salary25">25th percentile = $${Salary25th}</p>
                          <p class="salary50">50th percentile = $${Salary50th}</p>
                          <p class="salary75">75th percentile = $${Salary75th}</p>
                        </li>
                        `
  Savedlist.insertAdjacentHTML(position, CountryEntity);
};

//------------------------- Saved Countries Funtion -------------------------//

function DeleteSavedCountry (element){

  //find selected Country Data
  var ArraySelected = element.id;

  //updated Local Storage to not display this information
  SavedCountrydata[ArraySelected][0]["Saved"] = false;
  localStorage.setItem("SOFTWARESALARYDATA", JSON.stringify(SavedCountrydata));

  //remove element from list
  element.parentNode.parentNode.removeChild(element.parentNode);
}

//------------------------- Search Funtions -------------------------//

//Finding the URL for the Country that was Searched From the API
function CountrySearch (CountryName, callback){
  CountryToSearch = CountryName;
  Link = "";

  $.ajax({
    type: 'GET',
    url: 'https://api.teleport.org/api/countries/',
    success: function(data){
      Importantdata = data["_links"]["country:items"];
      $.each(Importantdata, function(index, Country) {
        if(Country.name == CountryToSearch){
          Link = Country.href;
          callback(Link);
        }
      });
      if(Link == ""){
        callback("error");
      }
    }
  });

};

//Finding the Salary Values from the API
function SalarySearch (CountryLink, callback){
  LinkForCountrySalaryAPI = CountryLink + "salaries/";
  Salaries = "";

  $.ajax({
    type: 'GET',
    url: LinkForCountrySalaryAPI,
    success: function(data){
      Importantdata = data["salaries"];
      $.each(Importantdata, function(index, Career) {
        if(Career["job"]["title"] == "Software Engineer") {
          Salaries = Career["salary_percentiles"];
          callback(Salaries);
        }
      });
      if(Salaries == ""){
        callback("error");
      }
    }
  });

};

//Displaying the Searched Country into the Left Panel
function DisplaySearchedCountry (CountryName){
  CurrentSearchedCountrydata = [];
  var CountryLinkToStore = "";

  //removing the current Search entity If there is one
  if(document.getElementById("SearchResult")){
    CurrentEntity = document.getElementById("SearchResult");
    CurrentEntity.parentNode.removeChild(CurrentEntity);
  }

  if(CountryName){
    CountrySearch(CountryName, function(CountryLink){
      if(CountryLink == "error"){
        console.log("There is no Country by that name");
      }else{
        CountryLinkToStore = CountryLink;
        SalarySearch(CountryLink, function(Salaries){
          if(Salaries == "error"){
            console.log("There is no Software Engineering data for that Country");
          }else{
            //getting the data for the new Search entity in case the Search is saved
            var JSONdata = {
              "CountryName" : CountryName,
              "Link" : CountryLinkToStore,
              "25th percentile" : Salaries["percentile_25"].toFixed(2),
              "50th percentile" : Salaries["percentile_50"].toFixed(2),
              "75th percentile" : Salaries["percentile_75"].toFixed(2),
              "Saved" : false
            }

            CurrentSearchedCountrydata.push(JSONdata);

            //Creating the new Search entity
            const SearchEntity = `
                                  <li class="itemLeft" id="SearchResult">
                                    <i class="fa fa-floppy-o sa" job="Save" id = "${id}"></i>
                                    <p class="Country">${CountryName}</p>
                                    <p class="salary25">25th percentile = $${Salaries["percentile_25"].toFixed(2)}</p>
                                    <p class="salary50">50th percentile = $${Salaries["percentile_50"].toFixed(2)}</p>
                                    <p class="salary75">75th percentile = $${Salaries["percentile_75"].toFixed(2)}</p>
                                  </li>
                                `;
            Searchlist.insertAdjacentHTML(position, SearchEntity);
          }
        });
      }
    });
  }
}

//------------------------- Event Listners -------------------------//

//Searching by clicking on the magnifying glass
search.addEventListener("click", function(){
  const CountryName = input.value;
  DisplaySearchedCountry(CountryName);
  input.value = "";
});

//Searching by clicking enter key
document.addEventListener("keyup",function(event){
  if(event.keyCode == 13){
    const CountryName = input.value;
    DisplaySearchedCountry(CountryName);
    input.value = "";
    input.blur();
  }
});

Searchlist.addEventListener("click", function(event){
  const element = event.target;
  const elementJob = element.attributes.job.value;

  if(elementJob == "Save"){
    SaveCountry();
  }
});

Savedlist.addEventListener("click", function(event){
  const element = event.target;
  const elementJob = element.attributes.job.value;

  if(elementJob == "Delete"){
    DeleteSavedCountry(element);
  }
});
