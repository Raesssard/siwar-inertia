<?php

namespace App\Console\Commands;

use App\Http\Controllers\Rt\RtIuranController;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class GenerateMonthlyTagihan extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'iuran:generate-tagihan';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate tagihan otomatis bulanan untuk iuran otomatis';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        app(RtIuranController::class)->generateMonthlyTagihan(request());
        $this->info('Tagihan otomatis berhasil dibuat.');
    }
}
