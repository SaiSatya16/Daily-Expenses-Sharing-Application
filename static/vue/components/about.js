const about = Vue.component("about", {
    template: `
      <div class="main-container d-flex flex-column justify-content-start align-items-center">
        <div class="content-container border rounded shadow-lg p-5 bg-white" style="width: 80%; max-width: 800px; margin-top: 5vh;">
          <h1 class="text-center mb-5" style="color: #d04a02;">About This Project</h1>
          
          <div class="mb-5">
            <h2 class="text-center mb-4" style="color: #2e2058;">Project Contributors</h2>
            <ul class="list-unstyled text-center">
              <li class="mb-3"><span class="contributor-name">J Sai Satya</span></li>
            </ul>
          </div>
  
          <div class="text-center">
            <button class="btn mt-3" style="background-color: #d04a02; color: white;">Learn More</button>
          </div>
        </div>
      </div>
    `,
  });
  
  export default about;