(function () {
  "use strict";
  window.NetPrint.addRoute("wizard", `
<section class="route" id="route-wizard" data-route="wizard" hidden>
  <h1>Guided Setup Wizard</h1>
  <p class="lede">Answer a few questions and follow a tailored, numbered walkthrough. Your place is saved as you go.</p>

  <div class="wizard" id="wizard">
    <div class="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" id="wizardProgressTrack">
      <div class="progress-fill" id="wizardProgressFill"></div>
    </div>
    <p class="progress-label" id="wizardProgressLabel">Step 1 of 1</p>

    <div id="wizardStepHost"></div>

    <div class="wizard-nav">
      <button class="btn btn-ghost" id="wizardPrev" type="button">\u2190 Previous</button>
      <button class="btn btn-primary" id="wizardNext" type="button">Next \u2192</button>
    </div>
  </div>
</section>`);
})();
